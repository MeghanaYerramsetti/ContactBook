import json
import os

# File to store contacts
CONTACTS_FILE = "contacts.json"

# Load contacts from file
def load_contacts():
    if os.path.exists(CONTACTS_FILE):
        with open(CONTACTS_FILE, "r") as file:
            return json.load(file)
    return {}

# Save contacts to file
def save_contacts(contacts):
    with open(CONTACTS_FILE, "w") as file:
        json.dump(contacts, file, indent=4)

# Add a new contact
def add_contact():
    name = input("Enter name: ").strip()
    phone = input("Enter phone number: ").strip()
    email = input("Enter email: ").strip()
    address = input("Enter address: ").strip()
    contacts[name] = {"phone": phone, "email": email, "address": address}
    save_contacts(contacts)
    print("Contact added successfully!")

# View all contacts
def view_contacts():
    if not contacts:
        print("No contacts found.")
        return
    print("\nContact List:")
    for name, details in contacts.items():
        print(f"{name}: {details['phone']}")
    print()

# Search for a contact
def search_contact():
    query = input("Enter name or phone number to search: ").strip()
    found = False
    for name, details in contacts.items():
        if query.lower() in name.lower() or query in details["phone"]:
            print(f"\nName: {name}")
            print(f"Phone: {details['phone']}")
            print(f"Email: {details['email']}")
            print(f"Address: {details['address']}\n")
            found = True
    if not found:
        print("No matching contact found.")

# Update a contact
def update_contact():
    name = input("Enter the name of the contact to update: ").strip()
    if name in contacts:
        print("Leave a field blank to keep it unchanged.")
        phone = input(f"New phone ({contacts[name]['phone']}): ").strip() or contacts[name]["phone"]
        email = input(f"New email ({contacts[name]['email']}): ").strip() or contacts[name]["email"]
        address = input(f"New address ({contacts[name]['address']}): ").strip() or contacts[name]["address"]
        contacts[name] = {"phone": phone, "email": email, "address": address}
        save_contacts(contacts)
        print("Contact updated successfully!")
    else:
        print("Contact not found.")

# Delete a contact
def delete_contact():
    name = input("Enter the name of the contact to delete: ").strip()
    if name in contacts:
        del contacts[name]
        save_contacts(contacts)
        print("Contact deleted successfully!")
    else:
        print("Contact not found.")

# Main menu
def main():
    global contacts
    contacts = load_contacts()
    while True:
        print("\nContact Management System")
        print("1. Add Contact")
        print("2. View Contact List")
        print("3. Search Contact")
        print("4. Update Contact")
        print("5. Delete Contact")
        print("6. Exit")
        choice = input("Enter your choice: ").strip()

        if choice == "1":
            add_contact()
        elif choice == "2":
            view_contacts()
        elif choice == "3":
            search_contact()
        elif choice == "4":
            update_contact()
        elif choice == "5":
            delete_contact()
        elif choice == "6":
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
