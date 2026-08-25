export interface Owner {
  id: number
  name: string
  company?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  status: string
}

export interface Listing {
  id: number
  ownerId: number
  owner?: Owner
  title: string
  category: string
  description?: string | null
  location?: string | null
  capacity?: string | null
  dailyRate?: string | null
  currency: string
  status: string
}

export interface Requester {
  id: number
  fname: string
  lname: string
  company?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  status: string
}

export interface BookingRequest {
  id: number
  requesterId: number
  requester?: Requester
  listingId: number
  listing?: Listing
  startDate: string
  endDate?: string | null
  amount?: string | null
  currency: string
  status: string
  notes?: string | null
}

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'owner-select' | 'listing-select' | 'requester-select'
  options?: string[]
  required?: boolean
  placeholder?: string
}

export interface ColumnDef<T> {
  key: string
  label: string
  render?: (row: T) => string
}
