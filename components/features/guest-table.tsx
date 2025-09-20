'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProcessedGuest } from '@/lib/types'
import { formatDateForDisplay } from '@/lib/utils/templates'

interface GuestTableProps {
  guests: ProcessedGuest[]
  title: string
}

const getSegmentVariant = (segment: string) => {
  switch (segment) {
    case 'Promoter_VIP':
      return 'default'
    case 'Promoter':
      return 'secondary'
    case 'HighValue_Recent':
      return 'outline'
    case 'AtRisk':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function GuestTable({ guests, title }: GuestTableProps) {
  if (guests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title} ({guests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No guests found matching your criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({guests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Guest</th>
                <th className="text-left p-2 font-medium">Segment</th>
                <th className="text-left p-2 font-medium">Last Property</th>
                <th className="text-left p-2 font-medium">Last Checkout</th>
                <th className="text-left p-2 font-medium">Lifetime Spend</th>
                <th className="text-left p-2 font-medium">Avg Rating</th>
                <th className="text-left p-2 font-medium">Channels</th>
                <th className="text-left p-2 font-medium">Next Outreach</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, index) => {
                const nextOutreach = guest.outreaches.find(
                  outreach => new Date(outreach.send_date) > new Date()
                )
                const availableChannels = []
                if (guest.consent_email) availableChannels.push('📧')
                if (guest.consent_sms) availableChannels.push('📱')

                return (
                  <tr 
                    key={guest.guest_id} 
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="p-2">
                      <div className="font-medium">{guest.first_name} {guest.last_name}</div>
                      <div className="text-sm text-muted-foreground">{guest.email}</div>
                    </td>
                    <td className="p-2">
                      <Badge variant={getSegmentVariant(guest.derived.segment)}>
                        {guest.derived.segment}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">{guest.last_property}</td>
                    <td className="p-2 text-sm">
                      {formatDateForDisplay(guest.last_check_out)}
                    </td>
                    <td className="p-2 text-sm">${guest.lifetime_spend.toFixed(2)}</td>
                    <td className="p-2 text-sm">
                      <div className="flex items-center">
                        <span className="mr-1">⭐</span>
                        {guest.avg_review_score.toFixed(1)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {availableChannels.map((channel, i) => (
                          <span key={i} className="text-sm">
                            {channel}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      {nextOutreach ? (
                        <div>
                          <div className="font-medium">{nextOutreach.outreach}</div>
                          <div className="text-muted-foreground">
                            {formatDateForDisplay(nextOutreach.send_date)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Complete</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}