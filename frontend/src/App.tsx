import { useEffect, useState } from 'react'
import Sidebar, { type NavItem } from './components/Sidebar'
import ResourceView from './components/ResourceView'
import { listResource } from './api'
import type { BookingRequest, Listing, Owner, Requester } from './types'

const NAV: NavItem[] = [
  { key: 'owners', label: 'Owners' },
  { key: 'listings', label: 'Listings' },
  { key: 'requesters', label: 'Requesters' },
  { key: 'booking-requests', label: 'Booking Requests' },
]

const ownerName = (row: { owner?: Owner }) => row.owner ? row.owner.name : '—'
const listingTitle = (row: { listing?: Listing }) => row.listing ? row.listing.title : '—'
const requesterName = (row: { requester?: Requester }) => row.requester ? `${row.requester.fname} ${row.requester.lname}` : '—'

export default function App() {
  const [active, setActive] = useState('owners')
  const [owners, setOwners] = useState<Owner[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [requesters, setRequesters] = useState<Requester[]>([])

  useEffect(() => {
    listResource<Owner>('owners').then(r => setOwners(r.data)).catch(() => {})
    listResource<Listing>('listings').then(r => setListings(r.data)).catch(() => {})
    listResource<Requester>('requesters').then(r => setRequesters(r.data)).catch(() => {})
  }, [active])

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-[13px]">
      <header className="flex items-center gap-3 h-[46px] px-5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[15px] font-extrabold tracking-tight text-accent">
          marketplace<span className="text-txt2 font-normal">intake</span>
        </span>
        <div className="flex-1" />
        <span className="text-xs text-txt2">Type 1 &middot; Pure SassFactory reuse</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={NAV} selected={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {active === 'owners' && (
            <ResourceView<Owner>
              resource="owners"
              title="Owners"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'company', label: 'Company' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'name', label: 'Name', required: true },
                { key: 'company', label: 'Company' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'notes', label: 'Notes' },
              ]}
            />
          )}

          {active === 'listings' && (
            <ResourceView<Listing>
              resource="listings"
              title="Listings"
              owners={owners}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'owner', label: 'Owner', render: ownerName },
                { key: 'category', label: 'Category' },
                { key: 'location', label: 'Location' },
                { key: 'dailyRate', label: 'Daily rate' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'ownerId', label: 'Owner', type: 'owner-select', required: true },
                { key: 'title', label: 'Title', required: true },
                { key: 'category', label: 'Category (event-space/equipment)', placeholder: 'event-space' },
                { key: 'location', label: 'Location' },
                { key: 'capacity', label: 'Capacity / qty', type: 'number' },
                { key: 'dailyRate', label: 'Daily rate', type: 'number' },
              ]}
            />
          )}

          {active === 'requesters' && (
            <ResourceView<Requester>
              resource="requesters"
              title="Requesters"
              columns={[
                { key: 'fname', label: 'First name' },
                { key: 'lname', label: 'Last name' },
                { key: 'company', label: 'Company' },
                { key: 'phone', label: 'Phone' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'fname', label: 'First name', required: true },
                { key: 'lname', label: 'Last name', required: true },
                { key: 'company', label: 'Company' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'notes', label: 'Notes' },
              ]}
            />
          )}

          {active === 'booking-requests' && (
            <ResourceView<BookingRequest>
              resource="booking-requests"
              title="Booking Requests"
              listings={listings}
              requesters={requesters}
              quickAction={{ label: 'Book', action: 'book', showIf: r => r.status === 'pending' }}
              columns={[
                { key: 'listing', label: 'Listing', render: listingTitle },
                { key: 'requester', label: 'Requester', render: requesterName },
                { key: 'startDate', label: 'Start', render: r => new Date(r.startDate).toLocaleDateString() },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'listingId', label: 'Listing', type: 'listing-select', required: true },
                { key: 'requesterId', label: 'Requester', type: 'requester-select', required: true },
                { key: 'startDate', label: 'Start date', type: 'date', required: true },
                { key: 'endDate', label: 'End date', type: 'date' },
                { key: 'amount', label: 'Amount', type: 'number' },
              ]}
            />
          )}
        </main>
      </div>
    </div>
  )
}
