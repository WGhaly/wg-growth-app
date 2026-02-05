'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { UserPlus, AlertCircle } from 'lucide-react';
import { createPerson } from '@/actions/relationships';

interface Contact {
  name?: string[];
  tel?: string[];
  email?: string[];
}

export function ContactsImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Only check support on client-side
    setIsClient(true);
    
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
    
    // Contact Picker API is only supported on Chrome/Edge for Android, not iOS
    if (typeof window !== 'undefined' && 'contacts' in navigator) {
      setIsSupported(true);
    }
  }, []);

  // Parse vCard text to extract contact info
  const parseVCard = (vcardText: string): Contact[] => {
    const contacts: Contact[] = [];
    const vcards = vcardText.split('BEGIN:VCARD').filter(Boolean);

    for (const vcard of vcards) {
      const lines = vcard.split('\n');
      const contact: Contact = {};

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('FN:')) {
          contact.name = [trimmed.substring(3)];
        } else if (trimmed.startsWith('TEL')) {
          const telMatch = trimmed.match(/:(.*)/);
          if (telMatch) {
            contact.tel = contact.tel || [];
            contact.tel.push(telMatch[1]);
          }
        } else if (trimmed.startsWith('EMAIL')) {
          const emailMatch = trimmed.match(/:(.*)/);
          if (emailMatch) {
            contact.email = contact.email || [];
            contact.email.push(emailMatch[1]);
          }
        }
      }

      if (contact.name) {
        contacts.push(contact);
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

      await importContactsToDatabase(contacts);
    } catch (error) {
      console.error('File import error:', error);
      setMessage({ type: 'error', text: 'Failed to read contact file' });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Shared import logic
  const importContactsToDatabase = async (contacts: Contact[]) => {
    let imported = 0;
    let failed = 0;
    let skipped = 0;

    for (const contact of contacts) {
      try {
        // Parse name
        const fullName = contact.name?.[0] || 'Unknown';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.slice(1).join(' ') || undefined;

        // Get phone and email
        const phoneNumber = contact.tel?.[0] || undefined;
        const email = contact.email?.[0] || undefined;

        // Skip if no identifiable information
        if (!phoneNumber && !email && firstName === 'Unknown') {
          skipped++;
          continue;
        }

        // Create person with default values
        const result = await createPerson({
          firstName,
          lastName,
          relationshipType: 'friend',
          circle: 'outer',
          trustLevel: 'medium',
          phoneNumber,
          email,
          notes: 'Imported from contacts'
        });

        if (result.success) {
          imported++;
        } else {
          failed++;
          console.error('Failed to import contact:', fullName, result.error);
        }
      } catch (error) {
        failed++;
        console.error('Error importing contact:', error);
      }
    }

    if (imported > 0) {
      setMessage({
        type: 'success',
        text: `✅ Imported ${imported} contact${imported > 1 ? 's' : ''}!${skipped > 0 ? ` Skipped ${skipped} duplicate${skipped > 1 ? 's' : ''}.` : ''}${failed > 0 ? ` ${failed} failed.` : ''} You can import again anytime to add new contacts.`
      });
      
      // Refresh the page to show new contacts
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      setMessage({
        type: 'error',
        text: `No contacts imported. ${skipped > 0 ? `${skipped} were duplicates. ` : ''}${failed > 0 ? `${failed} failed.` : ''}`
      });
    }
  };

  const handleImportContacts = async () => {
    // Check if Contact Picker API is supported
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

      // Request contacts from the user's device
      const props = ['name', 'tel', 'email'];
      const opts = { multiple: true };

      // @ts-ignore - Contact Picker API types
      const contacts = await navigator.contacts.select(props, opts);

      if (!contacts || contacts.length === 0) {
        setMessage({ type: 'error', text: 'No contacts selected' });
        return;
      }

      await importContactsToDatabase(contacts as Contact[]);
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
            {isImporting ? 'Importing...' : 'Import Contacts'}
          </Button>
          <p className="text-xs text-text-tertiary text-center">
            ✨ Direct import available on your device
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
                <p className="font-medium mb-1">iOS Contact Import</p>
                <p className="text-xs text-text-tertiary">
                  Apple doesn't allow web apps to access contacts directly. Here's the quickest way:
                </p>
              </div>
            </div>

            <ol className="text-xs text-text-secondary space-y-2 pl-4 list-decimal">
              <li>Open <strong>Contacts</strong> app on your iPhone</li>
              <li>Tap any contact → <strong>Share Contact</strong></li>
              <li>Select <strong>multiple contacts</strong> (or all)</li>
              <li>Choose <strong>Save to Files</strong></li>
              <li>Come back here and tap the button below</li>
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
              {isImporting ? 'Importing...' : 'Select Exported File'}
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
            {isImporting ? 'Importing...' : 'Import from vCard File'}
          </Button>
          <p className="text-xs text-text-tertiary text-center">
            Export contacts as .vcf file, then import here
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
  );
}
