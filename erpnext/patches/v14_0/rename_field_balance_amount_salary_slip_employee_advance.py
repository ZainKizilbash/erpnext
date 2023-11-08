from __future__ import unicode_literals
import frappe
from frappe.model.utils.rename_field import rename_field

def execute():
	frappe.reload_doc("HR", "doctype", "advances")
	rename_field("Salary Slip Employee Advance", "balance_amount", "advance_amount")
