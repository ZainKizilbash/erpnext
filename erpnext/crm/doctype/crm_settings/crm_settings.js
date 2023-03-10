// Copyright (c) 2022, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('CRM Settings', {
	refresh: function(frm) {
		frm.trigger('update_dynamic_fields');
	},

	auto_create_opportunity_from_schedule: function(frm) {
		frm.trigger('update_dynamic_fields');
	},

	auto_mark_opportunity_as_lost: function(frm) {
		frm.trigger('update_dynamic_fields');
	},

	update_dynamic_fields: function(frm) {
		frm.set_df_property("maintenance_opportunity_reminder_days", "hidden", !frm.doc.auto_create_opportunity_from_schedule);
		frm.set_df_property("default_opportunity_type_for_schedule", "hidden", !frm.doc.auto_create_opportunity_from_schedule);

		frm.set_df_property("mark_opportunity_lost_after_days", "hidden", !frm.doc.auto_mark_opportunity_as_lost);
		frm.set_df_property("opportunity_auto_lost_reason", "hidden", !frm.doc.auto_mark_opportunity_as_lost);
	}
});
