import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { REFERRAL_SIGNUP_CREDIT } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, referralCode } = parsed.data;

    // Block @deluge.fund emails — reserved for admin accounts
    if (email.toLowerCase().endsWith("@deluge.fund")) {
      return NextResponse.json(
        { error: "This email domain is reserved for admin accounts." },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Create user + watershed in a transaction
    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        watershed: {
          create: {},
        },
      },
      include: { watershed: true },
    });

    // Handle referral code if provided
    if (referralCode) {
      const referral = await prisma.referral.findUnique({
        where: { code: referralCode },
      });

      if (referral && referral.status === "pending" && !referral.referredId) {
        // Link referral to new user
        const referrerWatershed = await prisma.watershed.findUnique({
          where: { userId: referral.referrerId },
        });

        if (referrerWatershed) {
          const newBalance = referrerWatershed.balance + REFERRAL_SIGNUP_CREDIT;

          await prisma.$transaction([
            prisma.referral.update({
              where: { id: referral.id },
              data: {
                referredId: user.id,
                status: "signed_up",
                signupCredit: REFERRAL_SIGNUP_CREDIT,
              },
            }),
            prisma.watershed.update({
              where: { userId: referral.referrerId },
              data: {
                balance: newBalance,
                totalInflow: { increment: REFERRAL_SIGNUP_CREDIT },
              },
            }),
            prisma.watershedTransaction.create({
              data: {
                watershedId: referrerWatershed.id,
                type: "referral_signup",
                amount: REFERRAL_SIGNUP_CREDIT,
                description: `Referral bonus: ${name} signed up`,
                balanceAfter: newBalance,
              },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    logError("api/auth/register", error, { route: "POST /api/auth/register" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
