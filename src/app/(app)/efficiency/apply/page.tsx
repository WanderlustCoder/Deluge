"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  EFFICIENCY_HOME_TYPE_LABELS,
  EFFICIENCY_HOME_TYPES,
  type EfficiencyHomeType,
} from "@/lib/constants";

type Step = 1 | 2 | 3;

export default function EfficiencyApplyPage() {
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Property info
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [homeType, setHomeType] = useState<EfficiencyHomeType>("single_family");
  const [ownershipStatus, setOwnershipStatus] = useState("owner");
  const [yearBuilt, setYearBuilt] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [currentEnergyBill, setCurrentEnergyBill] = useState("");

  // Step 2: Current condition (optional self-assessment)
  const [insulationCondition, setInsulationCondition] = useState("");
  const [windowType, setWindowType] = useState("");
  const [hvacAge, setHvacAge] = useState("");
  const [hvacType, setHvacType] = useState("");
  const [waterHeaterType, setWaterHeaterType] = useState("");
  const [roofCondition, setRoofCondition] = useState("");
  const [electricalPanelAmps, setElectricalPanelAmps] = useState("");
  const [roofOrientation, setRoofOrientation] = useState("");

  if (status === "unauthenticated") redirect("/login");

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        address, city, state, zipCode,
        homeType, ownershipStatus,
      };
      if (yearBuilt) body.yearBuilt = parseInt(yearBuilt);
      if (squareFootage) body.squareFootage = parseInt(squareFootage);
      if (currentEnergyBill) body.currentEnergyBill = parseFloat(currentEnergyBill);

      // Include assessment data if provided
      if (insulationCondition) body.insulationCondition = insulationCondition;
      if (windowType) body.windowType = windowType;
      if (hvacAge) body.hvacAge = parseInt(hvacAge);
      if (hvacType) body.hvacType = hvacType;
      if (waterHeaterType) body.waterHeaterType = waterHeaterType;
      if (roofCondition) body.roofCondition = roofCondition;
      if (electricalPanelAmps) body.electricalPanelAmps = parseInt(electricalPanelAmps);
      if (roofOrientation) body.roofOrientation = roofOrientation;

      const res = await fetch("/api/efficiency/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/efficiency/${data.home.id}`);
      } else {
        setError(data.error || "Application failed.");
        setStep(1);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = address && city && state && zipCode && homeType && ownershipStatus;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/efficiency" className="text-sm text-[#0D47A1] hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Efficiency
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFA000]/10 text-[#FFA000] flex items-center justify-center">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              Apply for Efficiency Upgrade
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Step {step} of 3
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-[#0D47A1]" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-6 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Step 1: Property Info */}
      {step === 1 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white">Property Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
                placeholder="ID"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={10}
                placeholder="83702"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Type</label>
              <select
                value={homeType}
                onChange={(e) => setHomeType(e.target.value as EfficiencyHomeType)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
              >
                {EFFICIENCY_HOME_TYPES.map((t) => (
                  <option key={t} value={t}>{EFFICIENCY_HOME_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ownership</label>
            <div className="flex gap-4">
              {[
                { value: "owner", label: "I own this home" },
                { value: "renter_with_permission", label: "Renter (with landlord permission)" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ownership"
                    value={opt.value}
                    checked={ownershipStatus === opt.value}
                    onChange={(e) => setOwnershipStatus(e.target.value)}
                    className="text-[#0D47A1]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year Built</label>
              <input
                type="number"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                placeholder="1985"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sq Ft</label>
              <input
                type="number"
                value={squareFootage}
                onChange={(e) => setSquareFootage(e.target.value)}
                placeholder="1500"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Energy Bill/mo</label>
              <input
                type="number"
                value={currentEnergyBill}
                onChange={(e) => setCurrentEnergyBill(e.target.value)}
                placeholder="$150"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => canProceedStep1 && setStep(2)}
            disabled={!canProceedStep1}
            className="w-full py-2.5 px-4 bg-[#0D47A1] hover:bg-[#0D47A1]/90 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Next: Home Condition <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Step 2: Current Condition (Self-Assessment) */}
      {step === 2 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white">Current Home Condition</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optional: Share what you know about your home. This helps estimate your upgrade plan. You can skip and have a professional assess later.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insulation</label>
              <select value={insulationCondition} onChange={(e) => setInsulationCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent">
                <option value="">Not sure</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Windows</label>
              <select value={windowType} onChange={(e) => setWindowType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent">
                <option value="">Not sure</option>
                <option value="single">Single pane</option>
                <option value="double">Double pane</option>
                <option value="triple">Triple pane</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HVAC Type</label>
              <select value={hvacType} onChange={(e) => setHvacType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent">
                <option value="">Not sure</option>
                <option value="furnace">Furnace</option>
                <option value="heat_pump">Heat Pump</option>
                <option value="boiler">Boiler</option>
                <option value="window_ac">Window AC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HVAC Age (years)</label>
              <input type="number" value={hvacAge} onChange={(e) => setHvacAge(e.target.value)} placeholder="10"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Water Heater</label>
              <select value={waterHeaterType} onChange={(e) => setWaterHeaterType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent">
                <option value="">Not sure</option>
                <option value="tank_gas">Tank (Gas)</option>
                <option value="tank_electric">Tank (Electric)</option>
                <option value="tankless">Tankless</option>
                <option value="heat_pump">Heat Pump</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roof Condition</label>
              <select value={roofCondition} onChange={(e) => setRoofCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent">
                <option value="">Not sure</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Electrical Panel (Amps)</label>
              <input type="number" value={electricalPanelAmps} onChange={(e) => setElectricalPanelAmps(e.target.value)} placeholder="100"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roof Orientation</label>
              <select value={roofOrientation} onChange={(e) => setRoofOrientation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent">
                <option value="">Not sure</option>
                <option value="south">South-facing</option>
                <option value="east">East-facing</option>
                <option value="west">West-facing</option>
                <option value="north">North-facing</option>
                <option value="flat">Flat</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-2.5 px-4 bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Review <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white">Review Your Application</h2>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Property</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>{address}</p>
              <p>{city}, {state} {zipCode}</p>
              <p>{EFFICIENCY_HOME_TYPE_LABELS[homeType]} &middot; {ownershipStatus === "owner" ? "Owner" : "Renter"}</p>
              {yearBuilt && <p>Built {yearBuilt}</p>}
              {squareFootage && <p>{parseInt(squareFootage).toLocaleString()} sq ft</p>}
              {currentEnergyBill && <p>Current energy bill: ${parseFloat(currentEnergyBill).toFixed(2)}/mo</p>}
            </div>
          </div>

          {(insulationCondition || windowType || hvacType || roofCondition) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Self-Assessment</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
                {insulationCondition && <p>Insulation: {insulationCondition}</p>}
                {windowType && <p>Windows: {windowType} pane</p>}
                {hvacType && <p>HVAC: {hvacType}{hvacAge ? `, ${hvacAge}yr` : ""}</p>}
                {waterHeaterType && <p>Water heater: {waterHeaterType}</p>}
                {roofCondition && <p>Roof: {roofCondition}</p>}
                {electricalPanelAmps && <p>Electrical: {electricalPanelAmps}A</p>}
                {roofOrientation && <p>Roof faces: {roofOrientation}</p>}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
            {insulationCondition || windowType || hvacType
              ? "Your self-assessment data will generate an initial upgrade plan and cost estimate. A professional assessment may adjust these."
              : "You'll be queued for a professional energy assessment after submission."}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 px-4 bg-[#00897B] hover:bg-[#00897B]/90 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> Submit Application</>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
