'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { UserPlus, AlertCircle } from 'lucide-react';
import { createPerson } from '@/actions/relationships';
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

  // Handle saving the configured contact
  const handleSaveContact = async (config: ContactConfig) => {
    try {
      setIsImporting(true);
      
      const result = await createPerson(config);

      if (result.success) {
        setSelectedContact(null);
        setMessage({ 
          type: 'success', 
          text: `✅ ${config.firstName} added to relationships!` 
        });
        
        // Refresh to show the new contact
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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

  const handleImportContacts = async () => {
    if (!('contacts' in navigator)) {
      setMessage({
        type: 'error',
        text: 'Direct contact import is not available on this device. Please use the file import option.'
      });
      return;
    }

    try {
      setIsImporting(true);
      setMessage(null);

      const props = ['name', 'tel', 'email'];
      const opts = { multiple: false }; // Single contact selection

      // @ts-ignore - Contact Picker API types
      const rawContacts = await navigator.contacts.select(props, opts);

      if (!rawContacts || rawContacts.length === 0) {
        setMessage({ type: 'error', text: 'No contact selected' });
        return;
      }

      // Get the single selected contact
      const contact = rawContacts[0];
      const selectedContact: Contact = {
        id: 'picker-single',
        name: contact.name?.[0] || 'Unknown',
        phone: contact.tel?.[0] || undefined,
        email: contact.email?.[0] || undefined
      };

      // Show configuration modal immediately
      setSelectedContact(selectedContact);
    } catch (error: any) {
      console.error('Contact picker error:', error);
      
      let errorMessage = 'Failed to import contact';
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

  // Hide completely on iOS - Contact Picker API not supported on any iOS browser
  if (isIOS) {
    return null;
  }

  // Only show on platforms that support Contact Picker API (Android Chrome/Edge)
  if (!isSupported) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
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
