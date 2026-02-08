import { prisma } from '@/lib/prisma';

export type RuleCategory = 'validation' | 'pricing' | 'eligibility' | 'routing' | 'limits';
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'regex';

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  and?: RuleCondition[];
  or?: RuleCondition[];
}

export interface RuleAction {
  type: 'set' | 'add' | 'multiply' | 'reject' | 'approve' | 'route' | 'notify';
  field?: string;
  value?: unknown;
  message?: string;
}

// Create rule
export async function createBusinessRule(data: {
  name: string;
  description?: string;
  category: RuleCategory;
  entityType?: string;
  conditions: RuleCondition;
  actions: RuleAction[];
  priority?: number;
  testMode?: boolean;
  createdBy: string;
}) {
  return prisma.businessRule.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      entityType: data.entityType,
      conditions: JSON.stringify(data.conditions),
      actions: JSON.stringify(data.actions),
      priority: data.priority ?? 0,
      testMode: data.testMode ?? false,
      createdBy: data.createdBy,
    },
  });
}

// Get rules
export async function getBusinessRules(options?: {
  category?: RuleCategory;
  entityType?: string;
  isActive?: boolean;
}) {
  return prisma.businessRule.findMany({
    where: {
      category: options?.category,
      entityType: options?.entityType,
      isActive: options?.isActive,
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });
}

// Get rule by ID
export async function getBusinessRule(id: string) {
  const rule = await prisma.businessRule.findUnique({
    where: { id },
    include: { evaluations: { take: 20, orderBy: { evaluatedAt: 'desc' } } },
  });

  if (!rule) return null;

  return {
    ...rule,
    conditions: JSON.parse(rule.conditions) as RuleCondition,
    actions: JSON.parse(rule.actions) as RuleAction[],
  };
}

// Toggle rule
export async function toggleBusinessRule(id: string, isActive: boolean) {
  return prisma.businessRule.update({
    where: { id },
    data: { isActive },
  });
}

// Evaluate rules for an entity
export async function evaluateRules(
  entityType: string,
  entityId: string,
  data: Record<string, unknown>
): Promise<{
  matched: string[];
  results: Record<string, unknown>;
  actions: RuleAction[];
}> {
  const rules = await prisma.businessRule.findMany({
    where: {
      isActive: true,
      OR: [{ entityType }, { entityType: null }],
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  const matched: string[] = [];
  const allActions: RuleAction[] = [];
  let results: Record<string, unknown> = { ...data };

  for (const rule of rules) {
    const conditions = JSON.parse(rule.conditions) as RuleCondition;
    const isMatch = evaluateCondition(conditions, results);

    // Log evaluation
    await prisma.ruleEvaluation.create({
      data: {
        ruleId: rule.id,
        entityType,
        entityId,
        matched: isMatch,
        result: JSON.stringify({ data: results, matched: isMatch }),
      },
    });

    if (isMatch) {
      matched.push(rule.id);
      const actions = JSON.parse(rule.actions) as RuleAction[];

      if (!rule.testMode) {
        // Apply actions
        for (const action of actions) {
          results = applyAction(action, results);
          allActions.push(action);
        }
      }
    }
  }

  return { matched, results, actions: allActions };
}

// Evaluate a single condition
function evaluateCondition(
  condition: RuleCondition,
  data: Record<string, unknown>
): boolean {
  // Handle nested AND conditions
  if (condition.and) {
    return condition.and.every((c) => evaluateCondition(c, data));
  }

  // Handle nested OR conditions
  if (condition.or) {
    return condition.or.some((c) => evaluateCondition(c, data));
  }

  const fieldValue = getNestedValue(data, condition.field);

  switch (condition.operator) {
    case 'eq':
      return fieldValue === condition.value;
    case 'neq':
      return fieldValue !== condition.value;
    case 'gt':
      return typeof fieldValue === 'number' && fieldValue > (condition.value as number);
    case 'lt':
      return typeof fieldValue === 'number' && fieldValue < (condition.value as number);
    case 'gte':
      return typeof fieldValue === 'number' && fieldValue >= (condition.value as number);
    case 'lte':
      return typeof fieldValue === 'number' && fieldValue <= (condition.value as number);
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(condition.value as string);
    case 'regex':
      return typeof fieldValue === 'string' && new RegExp(condition.value as string).test(fieldValue);
    default:
      return false;
  }
}

// Get nested value from object (e.g., "user.profile.name")
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

// Apply action to data
function applyAction(
  action: RuleAction,
  data: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...data };

  switch (action.type) {
    case 'set':
      if (action.field) {
        result[action.field] = action.value;
      }
      break;
    case 'add':
      if (action.field && typeof result[action.field] === 'number') {
        result[action.field] = (result[action.field] as number) + (action.value as number);
      }
      break;
    case 'multiply':
      if (action.field && typeof result[action.field] === 'number') {
        result[action.field] = (result[action.field] as number) * (action.value as number);
      }
      break;
    case 'reject':
      result._rejected = true;
      result._rejectReason = action.message;
      break;
    case 'approve':
      result._approved = true;
      break;
    case 'route':
      result._routeTo = action.value;
      break;
    case 'notify':
      result._notifications = [...((result._notifications as unknown[]) || []), action.message];
      break;
  }

  return result;
}

// Test rule against sample data
export async function testRule(
  ruleId: string,
  testData: Record<string, unknown>
): Promise<{ matched: boolean; result: Record<string, unknown> }> {
  const rule = await getBusinessRule(ruleId);
  if (!rule) {
    throw new Error('Rule not found');
  }

  const matched = evaluateCondition(rule.conditions, testData);
  let result = { ...testData };

  if (matched) {
    for (const action of rule.actions) {
      result = applyAction(action, result);
    }
  }

  return { matched, result };
}

// Get rule evaluation stats
export async function getRuleStats(ruleId: string) {
  const [total, matched] = await Promise.all([
    prisma.ruleEvaluation.count({ where: { ruleId } }),
    prisma.ruleEvaluation.count({ where: { ruleId, matched: true } }),
  ]);

  return {
    total,
    matched,
    matchRate: total > 0 ? matched / total : 0,
  };
}
