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
						frappe.model.sync(r.message);

						if (cur_frm && cur_frm.doc.doctype == "Work Order" && cur_frm.doc.name == doc.name) {
							cur_frm.reload_doc();
						}

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
				let [max, max_with_allowance] = erpnext.manufacturing.get_max_transferable_qty(doc, purpose);

				let fields = [
					{
						fieldtype: 'Float',
						label: __('Qty for {0}', [purpose]),
						fieldname: 'qty',
						description: __('Max: {0}', [format_number(max)]),
						reqd: 1,
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

				fields = fields.concat([
					{
						fieldtype: 'Section Break',
					},
					{
						label: __('Qty to Produce'),
						fieldname: 'qty_to_produce',
						fieldtype: 'Float',
						default: flt(doc.qty),
						read_only: 1,
					},
				]);

				if (doc.max_qty) {
					fields = fields.concat([
						{
							fieldtype: 'Column Break',
						},
						{
							label: __('Maximum Qty'),
							fieldname: 'max_qty',
							fieldtype: 'Float',
							default: flt(doc.max_qty),
							read_only: 1,
						},
					]);
				}

				fields = fields.concat([
					{
						fieldtype: 'Column Break',
					},
					{
						label: __('Produced Qty'),
						fieldname: 'produced_qty',
						fieldtype: 'Float',
						default: flt(doc.produced_qty),
						read_only: 1,
					},
				]);

				if (!doc.skip_transfer) {
					fields = fields.concat([
						{
							fieldtype: 'Column Break',
						},
						{
							label: __('Transferred Qty'),
							fieldname: 'transferred_qty',
							fieldtype: 'Float',
							default: flt(doc.material_transferred_for_manufacturing),
							read_only: 1,
						},
					]);
				}

				fields = fields.concat([
					{
						fieldtype: 'Section Break',
					},
					{
						label: __('Work Order'),
						fieldname: 'work_order',
						fieldtype: 'Link',
						options: "Work Order",
						default: doc.name,
						read_only: 1,
					},
					{
						label: __('Production Item'),
						fieldname: 'production_item',
						fieldtype: 'Link',
						options: "Item",
						default: doc.production_item,
						read_only: 1,
					},
					{
						label: __('Production Item Name'),
						fieldname: 'production_item_name',
						fieldtype: 'Data',
						default: doc.item_name,
						read_only: 1,
					},
				]);

				frappe.prompt(fields, data => {
					if (flt(data.qty) > max_with_allowance) {
						frappe.msgprint(__('Quantity can not be more than {0}', [format_number(max_with_allowance)]));
						reject();
					}
					data.purpose = purpose;
					resolve(data);
				}, __(purpose), __('Submit'));
			});
		});
	},

	get_max_transferable_qty: (doc, purpose) => {
		let max_qty_to_produce = flt(doc.max_qty) || flt(doc.qty);
		let qty_with_allowance = erpnext.manufacturing.get_qty_with_allowance(doc);

		let pending_qty = 0;
		let pending_qty_with_allowance = 0;

		if (doc.skip_transfer) {
			pending_qty = flt(doc.qty) - flt(doc.produced_qty);
			pending_qty_with_allowance = qty_with_allowance - flt(doc.produced_qty);
		} else {
			if (purpose === 'Manufacture') {
				let qty_to_produce = Math.min(flt(doc.material_transferred_for_manufacturing), flt(doc.qty));
				pending_qty = qty_to_produce - flt(doc.produced_qty);
				pending_qty_with_allowance = flt(doc.material_transferred_for_manufacturing) - flt(doc.produced_qty);
			} else {
				pending_qty = max_qty_to_produce - flt(doc.material_transferred_for_manufacturing);
				pending_qty_with_allowance = qty_with_allowance - flt(doc.material_transferred_for_manufacturing);
			}
		}

		pending_qty = Math.max(pending_qty, 0);

		let qty_precision = erpnext.manufacturing.get_work_order_precision();
		return [flt(pending_qty, qty_precision), flt(pending_qty_with_allowance, qty_precision)];
	},

	get_qty_with_allowance: function (doc) {
		if (flt(doc.max_qty)) {
			return flt(doc.max_qty, erpnext.manufacturing.get_work_order_precision());
		} else {
			let over_production_allowance = erpnext.manufacturing.get_over_production_allowance();
			let qty_with_allowance = flt(doc.qty) + flt(doc.qty) * over_production_allowance / 100;

			return flt(qty_with_allowance, erpnext.manufacturing.get_work_order_precision());
		}
	},

	get_work_order_precision: function () {
		let qty_df = frappe.meta.get_docfield("Work Order", "qty");
		return frappe.meta.get_field_precision(qty_df);
	},

	get_over_production_allowance: function () {
		return flt(frappe.defaults.get_default('overproduction_percentage_for_work_order'));
	}
});
