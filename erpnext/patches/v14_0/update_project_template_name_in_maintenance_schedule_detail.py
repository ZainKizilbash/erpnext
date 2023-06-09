import frappe

def execute():
	frappe.reload_doc("maintenance", "doctype", "maintenance_schedule_detail")

	frappe.db.sql("""update `tabMaintenance Schedule Detail` as msd  set msd.project_template_name = \
		( select pt.project_template_name from `tabProject Template` as pt  where pt.name = msd.project_template)""")
