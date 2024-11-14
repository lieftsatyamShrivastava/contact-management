const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// POST /contacts - Add a new contact
app.post('/contacts', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, company, jobTitle } = req.body;

    // Validation for required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required.' });
    }

    // Create new contact by the serve
    const newContact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        company,
        jobTitle,
      },
    });

    res.status(201).json(newContact);
  } catch (error) {
    if (error.code === 'P2002') {  
      res.status(409).json({ error: 'A contact with this email already exists.' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the contact.' });
    }
  }
});

// GET /contacts - List all contacts
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany();
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching contacts.' });
  }
});

// GET /contacts/:id - Get a specific contact by ID
app.get('/contacts/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the contact.' });
  }
});

// PUT /contacts/:id - Update a specific contact by ID
app.put('/contacts/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, company, jobTitle } = req.body;
    const contactId = parseInt(req.params.id);

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });
    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    // Update contact information
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        company,
        jobTitle,
      },
    });

    res.json(updatedContact);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A contact with this email already exists.' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the contact.' });
    }
  }
});

// DELETE /contacts/:id - Delete a contact by ID
app.delete('/contacts/:id', async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);

    // Check if contact exists before deleting
    const deletedContact = await prisma.contact.delete({
      where: { id: contactId },
    });
    res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') { // Prisma's record not found error code
      res.status(404).json({ error: 'Contact not found.' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while deleting the contact.' });
    }
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
