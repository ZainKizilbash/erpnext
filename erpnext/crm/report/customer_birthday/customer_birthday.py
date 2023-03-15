# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import today, getdate


def execute(filters=None):
	filters = frappe._dict(filters or {})
	filters.from_date = getdate(filters.from_date or today())
	filters.to_date = getdate(filters.to_date or today())

	filters.from_day = filters.from_date.day
	filters.to_day = filters.to_date.day

	filters.from_month = filters.from_date.month
	filters.to_month = filters.to_date.month

	columns = get_columns()
	data = get_data(filters)

	return columns, data


def get_data(filters):
	or_conditions = []

	if filters.from_date.year != filters.to_date.year:
		or_conditions.append("""(MONTH(date_of_birth), DAY(date_of_birth)) >= (%(from_month)s, %(from_day)s)
			AND (MONTH(date_of_birth), DAY(date_of_birth)) <= (12, 31)
		""")

		or_conditions.append("""(MONTH(date_of_birth), DAY(date_of_birth)) >= (1, 1)
			AND (MONTH(date_of_birth), DAY(date_of_birth)) <= (%(to_month)s, %(to_day)s)
		""")
	else:
		or_conditions.append("""(MONTH(date_of_birth), DAY(date_of_birth)) >= (%(from_month)s, %(from_day)s)
			AND (MONTH(date_of_birth), DAY(date_of_birth)) <= (%(to_month)s, %(to_day)s)
		""")

	or_conditions = " or ".join(["({0})".format(c) for c in or_conditions])

	data = frappe.db.sql("""
		SELECT
			name as customer, customer_type, customer_name, customer_group, territory, date_of_birth,
			mobile_no, mobile_no_2, phone_no
		FROM `tabCustomer`
		WHERE {0}
		ORDER BY MONTH(date_of_birth), DAY(date_of_birth)
	""".format(or_conditions), filters, as_dict=1)

	for d in data:
		d.contact_no = d.mobile_no or d.mobile_no_2 or d.phone_no

	return data


def get_columns():
	return [
		{
			"fieldname": "customer",
			"label": _("Customer"),
			"fieldtype": "Link",
			"options": "Customer",
			"width": "100"
		},
		{
			"fieldname": "customer_name",
			"label": _("Customer Name"),
			"fieldtype": "Data",
			"width": "150"
		},
		{
			"fieldname": "customer_type",
			"label": _("Type"),
			"fieldtype": "Data",
			"width": "100"
		},	
		{
			"fieldname": "customer_group",
			"label": _("Customer Group"),
			"fieldtype": "Data",
			"width": "150"
		},
		{
			"fieldname": "territory",
			"label": _("Territory"),
			"fieldtype": "Data",
			"width": "100"
		},
		{
			"fieldname": "date_of_birth",
			"label": _("Date of Birth"),
			"fieldtype": "Date",
			"width": "150"
		},
		{
			"fieldname": "contact_no",
			"label": _("Contact No"),
			"fieldtype": "Data",
			"width": "100"
		},
	]
