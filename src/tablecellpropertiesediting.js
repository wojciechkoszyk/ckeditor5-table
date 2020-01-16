/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellpropertiesediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToStyle, upcastStyleToAttribute, upcastBorderStyles } from './converters/tableproperties';
import { addBorderRules } from '@ckeditor/ckeditor5-engine/src/view/styles/border';
import { addPaddingRules } from '@ckeditor/ckeditor5-engine/src/view/styles/padding';
import { addBackgroundRules } from '@ckeditor/ckeditor5-engine/src/view/styles/background';
import TableEditing from './tableediting';
import TableCellPaddingCommand from './commands/tablecellpaddingcommand';

/**
 * The table cell properties editing feature.
 *
 * Introduces table cells's model attributes and their conversion:
 *
 * - border: `borderStyle`, `borderColor` and `borderWidth`
 * - background color: `backgroundColor`
 * - cell padding: `padding`
 * - horizontal and vertical alignment: `horizontalAlignment`, `verticalAlignment`
 * - cell width & height: `width` & `height`
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellPropertiesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellPropertiesEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableEditing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const viewDoc = editor.editing.view.document;

		viewDoc.addStyleProcessorRules( addBorderRules );
		viewDoc.addStyleProcessorRules( addPaddingRules );
		viewDoc.addStyleProcessorRules( addBackgroundRules );

		enableBorderProperties( schema, conversion );
		enableHorizontalAlignmentProperty( schema, conversion );
		enableProperty( schema, conversion, 'width', 'width' );
		enableProperty( schema, conversion, 'height', 'height' );
		enableProperty( schema, conversion, 'padding', 'padding' );
		editor.commands.add( 'tableCellPadding', new TableCellPaddingCommand( editor ) );
		enableProperty( schema, conversion, 'backgroundColor', 'background-color' );
		enableProperty( schema, conversion, 'verticalAlignment', 'vertical-align' );
	}
}

// Enables `'borderStyle'`, `'borderColor'` and `'borderWidth'` attributes for table cells.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableBorderProperties( schema, conversion ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
	} );
	upcastBorderStyles( conversion, 'td' );
	upcastBorderStyles( conversion, 'th' );
	downcastAttributeToStyle( conversion, 'tableCell', 'borderStyle', 'border-style' );
	downcastAttributeToStyle( conversion, 'tableCell', 'borderColor', 'border-color' );
	downcastAttributeToStyle( conversion, 'tableCell', 'borderWidth', 'border-width' );
}

// Enables `'horizontalAlignment'` attribute for table cells.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableHorizontalAlignmentProperty( schema, conversion ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ 'horizontalAlignment' ]
	} );

	conversion.attributeToAttribute( {
		model: {
			name: 'tableCell',
			key: 'horizontalAlignment',
			values: [ 'left', 'right', 'center', 'justify' ]
		},
		view: {
			// TODO: controversial one but I don't know if we want "default".
			left: {
				key: 'style',
				value: {
					'text-align': 'left'
				}
			},
			right: {
				key: 'style',
				value: {
					'text-align': 'right'
				}
			},
			center: {
				key: 'style',
				value: {
					'text-align': 'center'
				}
			},
			justify: {
				key: 'style',
				value: {
					'text-align': 'justify'
				}
			}
		}
	} );
}

// Enables conversion for an attribute for simple view-model mappings.
//
// @param {String} modelAttribute
// @param {String} styleName
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableProperty( schema, conversion, modelAttribute, styleName ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ modelAttribute ]
	} );
	upcastStyleToAttribute( conversion, 'tableCell', modelAttribute, styleName );
	downcastAttributeToStyle( conversion, 'tableCell', modelAttribute, styleName );
}