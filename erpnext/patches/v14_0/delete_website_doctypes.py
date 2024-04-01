import frappe


def execute():
	frappe.delete_doc_if_exists("DocType", "Shopping Cart Settings")
	frappe.delete_doc_if_exists("Module Def", "Shopping Cart")

	frappe.delete_doc_if_exists("DocType", "Products Settings")
	frappe.delete_doc_if_exists("DocType", "Homepage Section")
	frappe.delete_doc_if_exists("DocType", "Homepage")
	frappe.delete_doc_if_exists("DocType", "Homepage Featured Product")
	frappe.delete_doc_if_exists("DocType", "Homepage Section Card")
	frappe.delete_doc_if_exists("DocType", "Website Attribute")
	frappe.delete_doc_if_exists("DocType", "Website Filter Field")
	frappe.delete_doc_if_exists("Module Def", "Portal")

	frappe.delete_doc_if_exists("DocType", "Project Update")
	frappe.delete_doc_if_exists("DocType", "Project User")
	frappe.delete_doc_if_exists("DocType", "Website Item Group")

	frappe.delete_doc_if_exists("Web Form", "issues")
	frappe.delete_doc_if_exists("Web Form", "tasks")
	frappe.delete_doc_if_exists("Web Form", "student-applicant")
	frappe.delete_doc_if_exists("Web Form", "addresses")
	frappe.delete_doc_if_exists("Web Form", "prescription")
	frappe.delete_doc_if_exists("Web Form", "lab-test")
	frappe.delete_doc_if_exists("Web Form", "lab-test")
	frappe.delete_doc_if_exists("Web Form", "patient-appointments")
	frappe.delete_doc_if_exists("Web Form", "personal-details")
	frappe.delete_doc_if_exists("Web Form", "certification-application-usd")
	frappe.delete_doc_if_exists("Web Form", "certification-application")
	frappe.delete_doc_if_exists("Web Form", "grant-application")
	frappe.delete_doc_if_exists("Web Form", "job-application")
