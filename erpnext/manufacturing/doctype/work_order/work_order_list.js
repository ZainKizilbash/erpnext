frappe.listview_settings['Work Order'] = {
	add_fields: [
		"status", "docstatus", "production_status",
		"skip_transfer", "transfer_material_against",
		"qty", "max_qty", "produced_qty", "material_transferred_for_manufacturing",
		"production_item", "item_name", "stock_uom",
		"packing_slip_required", "packed_qty", "packing_status",
		"order_line_no",
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

	onload: function(listview) {
		listview.page.add_action_item(__("Finish Multiple"), function() {
			let work_orders = listview.get_checked_items();
			erpnext.manufacturing.finish_multiple_work_orders(work_orders);
		});
	},

	button: {
		show(doc) {
			let settings = frappe.listview_settings['Work Order'];
			return settings.can_start_work_order(doc) || settings.can_finish_work_order(doc);
		},
		get_label(doc) {
			let settings = frappe.listview_settings['Work Order'];
			if (settings.can_finish_work_order(doc)) {
				return __('Finish');
			} else if (settings.can_start_work_order(doc)) {
				return __('Start');
			}
		},
		get_class(doc) {
			let settings = frappe.listview_settings['Work Order'];
			if (settings.can_finish_work_order(doc)) {
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
			if (settings.can_finish_work_order(doc)) {
				method = () => erpnext.manufacturing.make_stock_entry(doc, "Manufacture");
			} else if (settings.can_start_work_order(doc)) {
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

	can_start_work_order: function (doc) {
		if (doc.docstatus != 1 || ["Completed", "Stopped"].includes(doc.status)) {
			return false;
		}

		return (
			!doc.skip_transfer
			&& doc.transfer_material_against != 'Job Card'
			&& flt(doc.material_transferred_for_manufacturing) < flt(doc.qty)
		);
	},

	can_finish_work_order: function (doc) {
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
