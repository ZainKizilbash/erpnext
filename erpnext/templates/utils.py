# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt


import frappe
import json


@frappe.whitelist(allow_guest=True)
def send_message(subject="Website Query", message="", sender="", phone_no="", country="", mobile_no="", full_name="", organization="", opportunity_args=None):
	from frappe.www.contact import send_message as website_send_message
	lead = customer = None

	website_send_message(sender=sender, subject=subject, message=message)

	customer = frappe.db.sql("""
		select distinct dl.link_name
		from `tabDynamic Link` dl
		left join `tabContact` c on dl.parent=c.name
		where dl.link_doctype='Customer' and c.email_id = %s
	""", sender)

	if customer:
		customer = customer[0][0]

	if not customer:
		lead = frappe.db.get_value('Lead', {"email_id": sender})
		if not lead:
			new_lead = frappe.get_doc(dict(
				doctype='Lead',
				email_id=sender,
				lead_name=full_name or sender.split('@')[0].title(),
				company_name=organization,
				phone=phone_no,
				mobile_no=mobile_no,
				country=country,
			)).insert(ignore_permissions=True)
		else:
			old_lead = frappe.get_doc("Lead", lead)
			old_lead_changed = False
			if full_name:
				old_lead.lead_name = full_name or sender.split('@')[0].title()
				old_lead_changed = True
			if organization:
				old_lead.company_name = organization
				old_lead_changed = True
			if phone_no:
				old_lead.phone = phone_no
				old_lead_changed = True

			# Set current number as primary and set old as secondary
			if mobile_no and old_lead.mobile_no and old_lead.mobile_no != mobile_no:
				old_lead.mobile_no_2 = old_lead.mobile_no
				old_lead.mobile_no = mobile_no
				old_lead_changed = True

			if old_lead_changed:
				old_lead.save(ignore_permissions=True)

	opportunity = frappe.get_doc(dict(
		doctype='Opportunity',
		opportunity_from='Customer' if customer else 'Lead',
		status='Open',
		title=subject,
		contact_email=sender
	))

	opportunity_args = json.loads(opportunity_args) if opportunity_args else {}

	for k, v in opportunity_args.items():
		if opportunity.meta.has_field(k):
			opportunity.set(k, v)

	if customer:
		opportunity.party_name = customer
	elif lead:
		opportunity.party_name = lead
	else:
		opportunity.party_name = new_lead.name

	opportunity.insert(ignore_permissions=True)

	comm = frappe.get_doc({
		"doctype": "Communication",
		"subject": subject,
		"content": message,
		"sender": sender,
		"sent_or_received": "Received",
		"reference_doctype": 'Opportunity',
		"reference_name": opportunity.name,
		"timeline_links": [
			{"link_doctype": opportunity.opportunity_from, "link_name": opportunity.party_name}
		]
	})
	comm.insert(ignore_permissions=True)

	return "okay"
