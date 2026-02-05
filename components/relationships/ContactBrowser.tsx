'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Search, Check, UserPlus } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ContactBrowserProps {
  contacts: Contact[];
  addedContactIds: Set<string>;
  onAddContact: (contact: Contact) => void;
  onClose: () => void;
}

export function ContactBrowser({ contacts, addedContactIds, onAddContact, onClose }: ContactBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phone?.includes(query) ||
      contact.email?.toLowerCase().includes(query)
    );
  });

  const remainingCount = contacts.length - addedContactIds.size;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Select Contacts</h2>
            <p className="text-sm text-text-tertiary mt-0.5">
              {remainingCount} of {contacts.length} contacts remaining
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-secondary rounded"
          >
            <X size={20} className="text-text-tertiary" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-tertiary">
                {searchQuery ? 'No contacts found matching your search' : 'No contacts available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => {
                const isAdded = addedContactIds.has(contact.id);
                return (
                  <div
                    key={contact.id}
                    className={`p-4 rounded-lg border ${
                      isAdded
                        ? 'bg-surface-secondary border-border opacity-60'
                        : 'bg-surface border-border hover:border-primary/50'
                    } transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary truncate">
                          {contact.name}
                        </h3>
                        <div className="mt-1 space-y-0.5">
                          {contact.phone && (
                            <p className="text-sm text-text-secondary truncate">
                              📱 {contact.phone}
                            </p>
                          )}
                          {contact.email && (
                            <p className="text-sm text-text-secondary truncate">
                              ✉️ {contact.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isAdded ? (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Check size={16} />
                            <span>Added</span>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAddContact(contact)}
                          >
                            <UserPlus size={16} className="mr-1.5" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
