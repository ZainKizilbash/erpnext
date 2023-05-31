frappe.provide("erpnext.manufacturing");

$.extend(erpnext.manufacturing, {
	make_stock_entry: function(doc, purpose) {
		if (doc.docstatus != 1) {
			return;
		}

		return erpnext.manufacturing.show_prompt_for_qty_input(doc, purpose).then(data => {
			return frappe.call({
				method: "erpnext.manufacturing.doctype.work_order.work_order.make_stock_entry",
				args: {
					"work_order_id": doc.name,
					"purpose": purpose,
					"scrap_remaining": data.scrap_remaining,
					"qty": data.qty
				},
				freeze: 1,
				callback: (r) => {
					if (r.message) {
						if (cur_frm && cur_frm.doc.doctype == "Work Order" && cur_frm.doc.name == doc.name) {
							cur_frm.reload_doc();
						}

						frappe.model.sync(r.message);
						if (r.message.docstatus != 1) {
							frappe.set_route('Form', r.message.doctype, r.message.name);
						}
					}
				}
			});
		});
	},

	show_prompt_for_qty_input: function(doc, purpose) {
		return new Promise((resolve, reject) => {
			frappe.model.with_doctype("Work Order", () => {
				let max = erpnext.manufacturing.get_max_transferable_qty(doc, purpose);

				let fields = [
					{
						fieldtype: 'Float',
						label: __('Qty for {0}', [purpose]),
						fieldname: 'qty',
						description: __('Max: {0}', [max]),
						default: max
					}
				];

				if (purpose === "Manufacture" && frappe.defaults.get_default('scrap_remaining_by_default')) {
					fields.push({
						fieldtype: 'Check',
						label: __('Scrap Remaining'),
						fieldname: 'scrap_remaining',
						default: cint(frappe.defaults.get_default('scrap_remaining_by_default')),
					})
				}

				fields.push({
					fieldtype: 'Section Break',
				});

				fields.push({
					label: __('Work Order'),
					fieldname: 'work_order',
					fieldtype: 'Link',
					options: "Work Order",
					default: doc.name,
					read_only: 1,
				});

				fields.push({
					label: __('Production Item'),
					fieldname: 'production_item',
					fieldtype: 'Link',
					options: "Item",
					default: doc.production_item,
					read_only: 1,
				});

				fields.push({
					fieldtype: 'Link',
					label: __('Production Item Name'),
					fieldname: 'production_item_name',
					default: doc.item_name,
					read_only: 1,
				});

				frappe.prompt(fields, data => {
					max += (max * erpnext.manufacturing.get_over_production_allowance()) / 100;

					if (data.qty > max) {
						frappe.msgprint(__('Quantity must not be more than {0}', [format_number(max)]));
						reject();
					}
					data.purpose = purpose;
					resolve(data);
				}, __('Select Quantity'), __('Create'));
			});
		});
	},

	get_max_transferable_qty: (doc, purpose) => {
		let max = 0;
		if (doc.skip_transfer) {
			max = flt(doc.qty) - flt(doc.produced_qty);
		} else {
			if (purpose === 'Manufacture') {
				max = flt(doc.material_transferred_for_manufacturing) - flt(doc.produced_qty);
			} else {
				max = flt(doc.qty) - flt(doc.material_transferred_for_manufacturing);
			}
		}
		return flt(max, precision('qty', doc));
	},

	get_over_production_allowance: function () {
		return flt(frappe.defaults.get_default('overproduction_percentage_for_work_order'));
	}
});
