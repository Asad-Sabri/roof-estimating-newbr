"use client";

import PlatformLayout from "@/components/layout/PlatformLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { usePlatformAccess } from "@/lib/auth/usePlatformAccess";
import { Settings, Save } from "lucide-react";
import { useState } from "react";

export default function SuperAdminSettingsPage() {
  useProtectedRoute();
  const { canEditPlatformSettings } = usePlatformAccess();
  const readOnly = !canEditPlatformSettings;
  const [settings, setSettings] = useState({
    systemName: "Superior Pro Roofing Systems",
    defaultPricing: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // Save settings logic here
    alert("Settings saved successfully!");
  };

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-gray-600" size={32} />
            System Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* System Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Name
            </label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              disabled={readOnly}
              readOnly={readOnly}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Default Pricing</p>
                <p className="text-sm text-gray-600">Use default pricing tables for all subscribers</p>
              </div>
              <label
                className={`relative inline-flex items-center ${readOnly ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={settings.defaultPricing}
                  onChange={(e) => setSettings({ ...settings, defaultPricing: e.target.checked })}
                  disabled={readOnly}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Enable email notifications for system events</p>
              </div>
              <label
                className={`relative inline-flex items-center ${readOnly ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  disabled={readOnly}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Enable SMS notifications for important events</p>
              </div>
              <label
                className={`relative inline-flex items-center ${readOnly ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  disabled={readOnly}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-900">Maintenance Mode</p>
                <p className="text-sm text-red-600">Put system in maintenance mode (blocks all users)</p>
              </div>
              <label
                className={`relative inline-flex items-center ${readOnly ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  disabled={readOnly}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          {!readOnly && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}
