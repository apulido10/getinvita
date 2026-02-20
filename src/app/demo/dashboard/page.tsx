import type { Metadata } from 'next';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { FullEventData } from '@/types';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const mockData: FullEventData = {
  event: {
    id: 'demo-event-001',
    slug: 'isabella-quinceanera-abc123',
    event_type: 'sweet15',
    event_name: "Isabella's Quinceañera",
    event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'paid',
    client_name: 'Maria Garcia',
    client_email: 'maria@example.com',
    access_token: 'demo-token',
    user_id: null,
    stripe_checkout_session_id: null,
    stripe_payment_intent_id: null,
    theme_id: null,
    theme_premium_paid: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  details: [
    { id: '1', event_id: 'demo-event-001', detail_key: 'honoree_name', detail_value: 'Isabella Garcia', created_at: new Date().toISOString() },
    { id: '2', event_id: 'demo-event-001', detail_key: 'venue_name', detail_value: 'Grand Ballroom at The Palace', created_at: new Date().toISOString() },
    { id: '3', event_id: 'demo-event-001', detail_key: 'venue_address', detail_value: '1234 Celebration Ave, Los Angeles, CA 90001', created_at: new Date().toISOString() },
    { id: '4', event_id: 'demo-event-001', detail_key: 'ceremony_time', detail_value: '16:00', created_at: new Date().toISOString() },
    { id: '5', event_id: 'demo-event-001', detail_key: 'reception_time', detail_value: '18:00', created_at: new Date().toISOString() },
    { id: '6', event_id: 'demo-event-001', detail_key: 'theme', detail_value: 'Enchanted Rose Garden', created_at: new Date().toISOString() },
    { id: '7', event_id: 'demo-event-001', detail_key: 'dress_code', detail_value: 'Formal / Semi-formal', created_at: new Date().toISOString() },
    { id: '8', event_id: 'demo-event-001', detail_key: 'parent_names', detail_value: 'Maria & Carlos Garcia', created_at: new Date().toISOString() },
  ],
  photos: [],
  music: [],
  rsvps: [
    { id: 'r1', event_id: 'demo-event-001', guest_name: 'Abuela Rosa', attending: true, guest_count: 2, message: 'So excited for my beautiful granddaughter!', created_at: new Date().toISOString() },
    { id: 'r2', event_id: 'demo-event-001', guest_name: 'Sofia Martinez', attending: true, guest_count: 3, message: 'Wouldn\'t miss it for the world!', created_at: new Date().toISOString() },
    { id: 'r3', event_id: 'demo-event-001', guest_name: 'David Hernandez', attending: false, guest_count: 0, message: 'So sorry we can\'t make it. Happy birthday Isabella!', created_at: new Date().toISOString() },
  ],
};

export default function DemoDashboardPage() {
  return (
    <div>
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-center text-sm text-yellow-800">
        Demo Mode — Uploads and saves won&apos;t persist. This is a UI preview only.
      </div>
      <DashboardClient initialData={mockData} lang="en" />
    </div>
  );
}
