import frappe

def execute():
	if 'Vehicles' not in frappe.get_active_domains():
		return

	projects = frappe.db.sql("""
		SELECT distinct parent FROM `tabProject Panel Detail`
		WHERE parenttype = 'Project'
	""")

	projects = [tup[0] for tup in projects]

	for project in projects:
		doc = frappe.get_doc("Project", project)
		total_panel_qty = sum([d.panel_qty for d in doc.get('vehicle_panels', [])])
		doc.db_set("total_panel_qty", total_panel_qty, update_modified=False)

	if projects:
		frappe.db.commit()
