'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Loader, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Config } from '../../types';

export default function SettingsPage() {
  const [config, setConfig] = useState<Config>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    scheduleDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '10:00',
    endTime: '17:00',
    retryAttempts: 3,
    retryDelay: 5,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await api.getConfig();
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Config, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleDayToggle = (day: string) => {
    setConfig((prev) => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter((d) => d !== day)
        : [...prev.scheduleDays, day],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(config);
      setSaved(true);
      alert('Configuration saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">SMTP Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
            <input
              type="text"
              value={config.smtpHost}
              onChange={(e) => handleChange('smtpHost', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
            <input
              type="text"
              value={config.smtpPort}
              onChange={(e) => handleChange('smtpPort', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="587"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
            <input
              type="text"
              value={config.smtpUser}
              onChange={(e) => handleChange('smtpUser', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
            <input
              type="password"
              value={config.smtpPass}
              onChange={(e) => handleChange('smtpPass', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">
              For Gmail, use an App Password instead of your regular password
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Configuration</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Active Days</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                (day) => (
                  <button
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-3 rounded-lg font-medium capitalize transition-colors ${
                      config.scheduleDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                )
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Emails will only be sent on selected days</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={config.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={config.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Emails will only be sent between these hours</p>
        </div>
      </div>

      {/* Failure Handling */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Failure Handling</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retry Attempts</label>
            <input
              type="number"
              value={config.retryAttempts}
              onChange={(e) => handleChange('retryAttempts', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of times to retry failed emails (0-10)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retry Delay (minutes)
            </label>
            <input
              type="number"
              value={config.retryDelay}
              onChange={(e) => handleChange('retryDelay', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="60"
            />
            <p className="text-xs text-gray-500 mt-1">
              Wait time between retry attempts (1-60 minutes)
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center space-x-2"
      >
        {saving ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Saving Configuration...</span>
          </>
        ) : saved ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Configuration Saved!</span>
          </>
        ) : (
          <>
            <SettingsIcon className="w-5 h-5" />
            <span>Save Configuration</span>
          </>
        )}
      </button>
    </div>
  );
}