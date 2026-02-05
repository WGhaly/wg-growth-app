'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { UserPlus, AlertCircle } from 'lucide-react';
import { createPerson } from '@/actions/relationships';
import { ContactBrowser } from './ContactBrowser';
import { ContactConfigModal, ContactConfig } from './ContactConfigModal';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export function ContactsImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // New state for browse-then-add flow
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [addedContactIds, setAddedContactIds] = useState<Set<string>>(new Set());
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
    
    if (typeof window !== 'undefined' && 'contacts' in navigator) {
      setIsSupported(true);
    }
  }, []);

  // Parse vCard text to extract contact info
  const parseVCard = (vcardText: string): Contact[] => {
    const contacts: Contact[] = [];
    const vcards = vcardText.split('BEGIN:VCARD').filter(Boolean);

    for (let i = 0; i < vcards.length; i++) {
      const vcard = vcards[i];
      const lines = vcard.split('\n');
      let name = '';
      let phone = '';
      let email = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('FN:')) {
          name = trimmed.substring(3);
        } else if (trimmed.startsWith('TEL')) {
          const telMatch = trimmed.match(/:(.*)/);
          if (telMatch && !phone) phone = telMatch[1];
        } else if (trimmed.startsWith('EMAIL')) {
          const emailMatch = trimmed.match(/:(.*)/);
          if (emailMatch && !email) email = emailMatch[1];
        }
      }

      if (name || phone || email) {
        contacts.push({
          id: `vcard-${i}`,
          name: name || 'Unknown',
          phone: phone || undefined,
          email: email || undefined
        });
      }
    }

    return contacts;
  };

  // Handle file import for vCard files
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage(null);

      const text = await file.text();
      const contacts = parseVCard(text);

      if (contacts.length === 0) {
        setMessage({ type: 'error', text: 'No valid contacts found in file' });
        return;
      }

      // Show browser instead of bulk importing
      setAvailableContacts(contacts);
      setAddedContactIds(new Set());
      setShowBrowser(true);
      setMessage({ 
        type: 'success', 
        text: `Found ${contacts.length} contacts. Select which ones to add.` 
      });
    } catch (error) {
      console.error('File import error:', error);
      setMessage({ type: 'error', text: 'Failed to read contact file' });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  // Handle adding a single contact with configuration
  const handleAddContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  // Handle saving the configured contact
  const handleSaveContact = async (config: ContactConfig) => {
    try {
      setIsImporting(true);
      
      const result = await createPerson(config);

      if (result.success) {
        // Mark contact as added
        setAddedContactIds(prev => new Set(prev).add(selectedContact!.id));
        setSelectedContact(null);
        setMessage({ 
          type: 'success', 
          text: `✅ ${config.firstName} added to relationships!` 
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add contact' });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      setMessage({ type: 'error', text: 'Failed to add contact' });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle closing the browser
  const handleCloseBrowser = () => {
    setShowBrowser(false);
    if (addedContactIds.size > 0) {
      // Refresh page to show new contacts
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleImportContacts = async () => {
    if (!('contacts' in navigator)) {
      setMessage({
        type: 'error',
        text: 'Direct contact import is not available on this device. Please use the file import option above.'
      });
      return;
    }

    try {
      setIsImporting(true);
      setMessage(null);

      const props = ['name', 'tel', 'email'];
      const opts = { multiple: true };

      // @ts-ignore - Contact Picker API types
      const rawContacts = await navigator.contacts.select(props, opts);

      if (!rawContacts || rawContacts.length === 0) {
        setMessage({ type: 'error', text: 'No contacts selected' });
        return;
      }

      // Convert to Contact format
      const contacts: Contact[] = rawContacts.map((c: any, i: number) => ({
        id: `picker-${i}`,
        name: c.name?.[0] || 'Unknown',
        phone: c.tel?.[0] || undefined,
        email: c.email?.[0] || undefined
      }));

      // Show browser instead of bulk importing
      setAvailableContacts(contacts);
      setAddedContactIds(new Set());
      setShowBrowser(true);
      setMessage({ 
        type: 'success', 
        text: `Found ${contacts.length} contacts. Select which ones to add.` 
      });
    } catch (error: any) {
      console.error('Contact picker error:', error);
      
      let errorMessage = 'Failed to import contacts';
      if (error.name === 'InvalidStateError') {
        errorMessage = 'Contact picker is not available. Please ensure you\'re using a supported browser.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Contact access requires a secure connection (HTTPS).';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsImporting(false);
    }
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="space-y-3">
        <Button
          disabled
          variant="secondary"
          fullWidth
        >
          <UserPlus size={18} className="mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Android: Direct Contact Picker */}
        {isSupported && !isIOS && (
          <>
            <Button
              onClick={handleImportContacts}
              disabled={isImporting}
              variant="secondary"
              fullWidth
            >
              <UserPlus size={18} className="mr-2" />
              {isImporting ? 'Loading...' : 'Select Contacts to Add'}
            </Button>
            <p className="text-xs text-text-tertiary text-center">
              ✨ Choose contacts from your device
            </p>
          </>
        )}

        {/* iOS: Show helpful instructions */}
        {isIOS && (
          <>
            <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-text-secondary">
                  <p className="font-medium mb-1">Import from Contacts</p>
                  <p className="text-xs text-text-tertiary">
                    Export your contacts as a .vcf file, then select which ones to add.
                  </p>
                </div>
              </div>

              <ol className="text-xs text-text-secondary space-y-2 pl-4 list-decimal">
                <li>Open <strong>Contacts</strong> app</li>
                <li>Tap a contact → <strong>Share Contact</strong></li>
                <li>Select <strong>multiple contacts</strong></li>
                <li>Choose <strong>Save to Files</strong></li>
                <li>Come back and upload the file below</li>
              </ol>

              <input
                type="file"
                id="contact-file-input"
                accept=".vcf,.vcard"
                onChange={handleFileImport}
                disabled={isImporting}
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById('contact-file-input')?.click()}
                disabled={isImporting}
                variant="primary"
                fullWidth
              >
                <UserPlus size={18} className="mr-2" />
                {isImporting ? 'Loading...' : 'Upload Contact File'}
              </Button>
            </div>
          </>
        )}

        {/* Fallback for other platforms */}
        {!isSupported && !isIOS && (
          <>
            <input
              type="file"
              id="contact-file-input"
              accept=".vcf,.vcard"
              onChange={handleFileImport}
              disabled={isImporting}
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById('contact-file-input')?.click()}
              disabled={isImporting}
              variant="secondary"
              fullWidth
            >
              <UserPlus size={18} className="mr-2" />
              {isImporting ? 'Loading...' : 'Upload vCard File'}
            </Button>
            <p className="text-xs text-text-tertiary text-center">
              Export contacts as .vcf file, then select which to add
            </p>
          </>
        )}

        {message && (
          <Alert
            variant={message.type === 'error' ? 'error' : 'success'}
            onClose={() => setMessage(null)}
          >
            {message.type === 'error' && <AlertCircle size={16} className="mr-2" />}
            {message.text}
          </Alert>
        )}
      </div>

      {/* Contact Browser Modal */}
      {showBrowser && (
        <ContactBrowser
          contacts={availableContacts}
          addedContactIds={addedContactIds}
          onAddContact={handleAddContact}
          onClose={handleCloseBrowser}
        />
      )}

      {/* Contact Configuration Modal */}
      {selectedContact && (
        <ContactConfigModal
          contact={selectedContact}
          onSave={handleSaveContact}
          onCancel={() => setSelectedContact(null)}
        />
      )}
    </>
  );
}
