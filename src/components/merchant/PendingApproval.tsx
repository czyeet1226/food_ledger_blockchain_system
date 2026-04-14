"use client";

import { Card } from "@/components/ui/Card";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function PendingApprovalScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl">
          <div className="text-center py-12 px-8">
            {/* Animated Clock Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Clock size={48} className="text-blue-500 animate-bounce" />
              </div>
            </div>

            {/* Status Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Pending Review
            </h1>

            {/* Status Message */}
            <p className="text-gray-600 text-lg mb-8">
              Your merchant registration is waiting for admin approval.
            </p>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <AlertCircle size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-blue-900 mb-2">
                    What happens next?
                  </p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Our admin team will review your application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>
                        You'll be notified once your account is approved
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>
                        After approval, you can access all vendor features
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 mb-8">
              {[
                {
                  title: "Application Submitted",
                  desc: "Your merchant registration has been received",
                  active: true,
                },
                {
                  title: "Under Review",
                  desc: "Admin team is reviewing your details",
                  active: false,
                },
                {
                  title: "Approval Complete",
                  desc: "You'll get full access to merchant features",
                  active: false,
                },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        step.active
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.active ? (
                        <Clock size={18} className="animate-spin" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    {idx < 2 && <div className="w-1 h-8 bg-gray-200 mt-2" />}
                  </div>
                  <div className="pt-2">
                    <p className="font-semibold text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">
                Questions? Contact our admin team at{" "}
                <span className="font-semibold text-gray-900">
                  support@foodledger.io
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center px-4">
          <p className="text-sm text-gray-500">
            This page will automatically update once your application is
            reviewed. No need to refresh manually.
          </p>
        </div>
      </div>
    </div>
  );
}
