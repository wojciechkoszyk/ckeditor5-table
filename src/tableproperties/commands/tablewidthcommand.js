/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablewidthcommand
 */

import { addDefaultUnitToNumericValue } from '../../commands/utils';
import TablePropertyCommand from './tablepropertycommand';

/**
 * The table width command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * `'tableWidth'` editor command.
 *
 * To change width of the selected table, execute the command:
 *
 *		editor.execute( 'tableWidth', {
 *			value: '400px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableWidth', {
 *			value: '50'
 *		} );
 *
 * Will set the `width` attribute to `'50px'` in the model.
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand
 */
export default class TableWidthCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'width' );
	}

	/**
	 * @inheritDoc
	 */
	_getValueToSet( value ) {
		return addDefaultUnitToNumericValue( value, 'px' );
	}
}
