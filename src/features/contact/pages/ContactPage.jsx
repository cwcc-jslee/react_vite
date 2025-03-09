import React from 'react';
import { ContactProvider } from '../context/ContactProvider';
import ContactContainer from '../containers/ContactContainer';

const ContactPage = () => {
  return (
    <ContactProvider>
      <ContactContainer />
    </ContactProvider>
  );
};

export default ContactPage;
