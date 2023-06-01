frappe.listview_settings['Work Order'] = {
	add_fields: [
		"status", "docstatus",
		"skip_transfer", "transfer_material_against",
		"qty", "max_qty", "produced_qty", "material_transferred_for_manufacturing",
		"production_item", "item_name",
	],
	get_indicator: function(doc) {
		if (doc.status==="Submitted") {
			return [__("Not Started"), "orange", "status,=,Submitted"];
		} else {
			return [__(doc.status), {
				"Draft": "red",
				"Stopped": "red",
				"Not Started": "orange",
				"In Process": "yellow",
				"Completed": "green",
				"Cancelled": "light-gray"
			}[doc.status], "status,=," + doc.status];
		}
	},
	button: {
		show(doc) {
			let settings = frappe.listview_settings['Work Order'];
			return settings.show_start_button(doc) || settings.show_finish_button(doc);
		},
		get_label(doc) {
			let settings = frappe.listview_settings['Work Order'];
			if (settings.show_finish_button(doc)) {
				return __('Finish');
			} else if (settings.show_start_button(doc)) {
				return __('Start');
			}
		},
		get_class(doc) {
			let settings = frappe.listview_settings['Work Order'];
			if (settings.show_finish_button(doc)) {
				return "btn-primary";
			} else {
				return "btn-default";
			}
		},
		get_description(doc) {
			return this.get_label(doc);
		},
		action(doc) {
			let settings = frappe.listview_settings['Work Order'];
			let method;
			if (settings.show_finish_button(doc)) {
				method = () => erpnext.manufacturing.make_stock_entry(doc, "Manufacture");
			} else if (settings.show_start_button(doc)) {
				method = () => erpnext.manufacturing.make_stock_entry(doc, 'Material Transfer for Manufacture');
			}

			if (method) {
				method().then(() => {
					if (cur_list && cur_list.doctype == "Work Order") {
						cur_list.refresh();
					}
				});
			}
		}
	},

	show_start_button: function (doc) {
		if (doc.docstatus != 1 || ["Completed", "Stopped"].includes(doc.status)) {
			return false;
		}

		return (
			!doc.skip_transfer
			&& doc.transfer_material_against != 'Job Card'
			&& flt(doc.material_transferred_for_manufacturing) < flt(doc.qty)
		);
	},

	show_finish_button: function (doc) {
		if (doc.docstatus != 1 || ["Completed", "Stopped"].includes(doc.status)) {
			return false;
		}

		if (doc.skip_transfer) {
			return flt(doc.produced_qty) < flt(doc.qty);
		} else {
			return flt(doc.produced_qty) < flt(doc.material_transferred_for_manufacturing);
		}
	},
};
