'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Contact, CustomField, Action } from '@/lib/types'
import { formatDateForDisplay } from '@/lib/utils/templates'

interface ContactsTableProps {
  contacts: Contact[]
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts Export ({contacts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No contacts to export. Process guests first.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Guest ID</th>
                  <th className="text-left p-2 font-medium">First Name</th>
                  <th className="text-left p-2 font-medium">Last Name</th>
                  <th className="text-left p-2 font-medium">Email</th>
                  <th className="text-left p-2 font-medium">Phone</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr 
                    key={contact.guest_id}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="p-2 font-mono text-sm">{contact.guest_id}</td>
                    <td className="p-2">{contact.first_name}</td>
                    <td className="p-2">{contact.last_name}</td>
                    <td className="p-2 text-sm">{contact.email}</td>
                    <td className="p-2 text-sm font-mono">{contact.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CustomFieldsTableProps {
  customFields: CustomField[]
}

export function CustomFieldsTable({ customFields }: CustomFieldsTableProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields Export ({customFields.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {customFields.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No custom fields to export. Process guests first.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Guest ID</th>
                  <th className="text-left p-2 font-medium">Segment</th>
                  <th className="text-left p-2 font-medium">Current Outreach</th>
                  <th className="text-left p-2 font-medium">Next Outreach</th>
                  <th className="text-left p-2 font-medium">Planned Send Date</th>
                </tr>
              </thead>
              <tbody>
                {customFields.map((field, index) => (
                  <tr 
                    key={field.guest_id}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="p-2 font-mono text-sm">{field.guest_id}</td>
                    <td className="p-2">
                      <Badge variant={getSegmentVariant(field.segment)}>
                        {field.segment}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">{field.current_outreach}</td>
                    <td className="p-2 text-sm">{field.next_outreach}</td>
                    <td className="p-2 text-sm">
                      {field.planned_send_date ? formatDateForDisplay(field.planned_send_date) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ActionsTableProps {
  actions: Action[]
}

export function ActionsTable({ actions }: ActionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions Export ({actions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No actions to export. Process guests first.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Guest ID</th>
                  <th className="text-left p-2 font-medium">Outreach</th>
                  <th className="text-left p-2 font-medium">Send Date</th>
                  <th className="text-left p-2 font-medium">Channel</th>
                  <th className="text-left p-2 font-medium">Template ID</th>
                  <th className="text-left p-2 font-medium">Dedupe Key</th>
                  <th className="text-left p-2 font-medium">Content Preview</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action, index) => (
                  <tr 
                    key={action.dedupeKey}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="p-2 font-mono text-sm">{action.guest_id}</td>
                    <td className="p-2 text-sm">
                      <Badge variant="outline">{action.outreach}</Badge>
                    </td>
                    <td className="p-2 text-sm">
                      {formatDateForDisplay(action.send_date)}
                    </td>
                    <td className="p-2 text-sm">
                      {action.channel === 'email' ? '📧' : '📱'} {action.channel}
                    </td>
                    <td className="p-2 text-sm font-mono">{action.template_id}</td>
                    <td className="p-2 text-xs font-mono text-muted-foreground">
                      {action.dedupeKey}
                    </td>
                    <td className="p-2 text-sm max-w-xs">
                      {action.channel === 'email' && action.filled_content?.subject ? (
                        <div className="truncate">
                          <strong>Subject:</strong> {action.filled_content.subject}
                        </div>
                      ) : action.channel === 'sms' && action.filled_content?.sms_text ? (
                        <div className="truncate">
                          <strong>SMS:</strong> {action.filled_content.sms_text}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No preview</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}