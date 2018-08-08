/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import { defaultConversion, defaultSchema, formatTable, modelTable } from '../_utils/utils';

describe( 'upcastTable()', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ImageEditing, Widget ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				defaultSchema( model.schema, false );

				defaultConversion( editor.conversion, true );

				// Since this part of test tests only view->model conversion editing pipeline is not necessary
				// so defining model->view converters won't be necessary.
				editor.editing.destroy();
			} );
	} );

	function expectModel( data ) {
		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable( data ) );
	}

	it( 'should convert table figure', () => {
		editor.setData(
			'<figure class="table">' +
			'<table>' +
			'<tr><td>1</td></tr>' +
			'</table>' +
			'</figure>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table without thead', () => {
		editor.setData(
			'<table>' +
			'<tr><td>1</td></tr>' +
			'</table>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should not convert empty figure', () => {
		'<figure class="table"></figure>';

		expectModel( '<paragraph></paragraph>' );
	} );

	it( 'should convert if figure do not have class="table" attribute', () => {
		editor.setData(
			'<figure>' +
			'<table>' +
			'<tr><td>1</td></tr>' +
			'</table>' +
			'</figure>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with one thead with one row', () => {
		editor.setData(
			'<table>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with one thead with more then one row', () => {
		editor.setData(
			'<table>' +
			'<thead>' +
			'<tr><td>1</td></tr>' +
			'<tr><td>2</td></tr>' +
			'<tr><td>3</td></tr>' +
			'</thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="3">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>3</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with two theads with one row', () => {
		editor.setData(
			'<table>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'<tbody><tr><td>2</td></tr></tbody>' +
			'<thead><tr><td>3</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>3</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with thead after the tbody', () => {
		editor.setData(
			'<table>' +
			'<tbody><tr><td>2</td></tr></tbody>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with one tfoot with one row', () => {
		editor.setData(
			'<table>' +
			'<tfoot><tr><td>1</td></tr></tfoot>' +
			'</table>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create valid table model from empty table', () => {
		editor.setData(
			'<table>' +
			'</table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should skip unknown table children', () => {
		editor.setData(
			'<table>' +
			'<caption>foo</caption>' +
			'<tr><td>bar</td></tr>' +
			'</table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should create table model from some broken table', () => {
		editor.setData(
			'<table><td><z>foo</z></td></table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should fix if inside other blocks', () => {
		// Using <div> instead of <p> as it breaks on Edge.
		editor.model.schema.register( 'div', {
			inheritAllFrom: '$block'
		} );
		editor.conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'div', view: 'div' } ) );

		editor.setData(
			'<div>foo' +
			'<table>' +
			'<tbody><tr><td>2</td></tr></tbody>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'</table>' +
			'bar</div>'
		);

		expectModel(
			'<div>foo</div>' +
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'</table>' +
			'<div>bar</div>'
		);
	} );

	it( 'should be possible to overwrite table conversion', () => {
		editor.model.schema.register( 'fooTable', {
			allowWhere: '$block',
			allowAttributes: [ 'headingRows' ],
			isObject: true
		} );
		editor.model.schema.register( 'fooCell', {
			allowIn: 'fooRow',
			isObject: true
		} );
		editor.model.schema.register( 'fooRow', {
			allowIn: 'fooTable',
			isObject: true
		} );

		editor.conversion.elementToElement( { model: 'fooTable', view: 'table', converterPriority: 'high' } );
		editor.conversion.elementToElement( { model: 'fooRow', view: 'tr', converterPriority: 'high' } );
		editor.conversion.elementToElement( { model: 'fooCell', view: 'td', converterPriority: 'high' } );
		editor.conversion.elementToElement( { model: 'fooCell', view: 'th', converterPriority: 'high' } );

		editor.setData(
			'<table>' +
			'<thead><tr><td>foo</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<fooTable><fooRow><fooCell></fooCell></fooRow></fooTable>'
		);
	} );

	it( 'should strip table in table', () => {
		editor.setData(
			'<table>' +
				'<tr>' +
					'<td>' +
						'<table>' +
							'<tr>' +
								'<td>tableception</td>' +
							'</tr>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</table>'
		);

		expectModel(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>tableception</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	describe( 'headingColumns', () => {
		it( 'should properly calculate heading columns', () => {
			editor.setData(
				'<table>' +
				'<tbody>' +
				// This row starts with 1 th (3 total).
				'<tr><th>21</th><td>22</td><th>23</th><th>24</th></tr>' +
				// This row starts with 2 th (2 total). This one has max number of heading columns: 2.
				'<tr><th>31</th><th>32</th><td>33</td><td>34</td></tr>' +
				// This row starts with 1 th (1 total).
				'<tr><th>41</th><td>42</td><td>43</td><td>44</td></tr>' +
				// This row starts with 0 th (3 total).
				'<tr><td>51</td><th>52</th><th>53</th><th>54</th></tr>' +
				'</tbody>' +
				'<thead>' +
				// This row has 4 ths but it is a thead.
				'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
				'</thead>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="2" headingRows="1">' +
				'<tableRow>' +
					'<tableCell><paragraph>11</paragraph></tableCell>' +
					'<tableCell><paragraph>12</paragraph></tableCell>' +
					'<tableCell><paragraph>13</paragraph></tableCell>' +
					'<tableCell><paragraph>14</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>21</paragraph></tableCell>' +
					'<tableCell><paragraph>22</paragraph></tableCell>' +
					'<tableCell><paragraph>23</paragraph></tableCell>' +
					'<tableCell><paragraph>24</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>31</paragraph></tableCell>' +
					'<tableCell><paragraph>32</paragraph></tableCell>' +
					'<tableCell><paragraph>33</paragraph></tableCell>' +
					'<tableCell><paragraph>34</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>41</paragraph></tableCell>' +
					'<tableCell><paragraph>42</paragraph></tableCell>' +
					'<tableCell><paragraph>43</paragraph></tableCell>' +
					'<tableCell><paragraph>44</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>51</paragraph></tableCell>' +
					'<tableCell><paragraph>52</paragraph></tableCell>' +
					'<tableCell><paragraph>53</paragraph></tableCell>' +
					'<tableCell><paragraph>54</paragraph></tableCell>' +
				'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should calculate heading columns of cells with colspan', () => {
			editor.setData(
				'<table>' +
				'<tbody>' +
				// This row has colspan of 3 so it should be the whole table should have 3 heading columns.
				'<tr><th>21</th><th>22</th><td>23</td><td>24</td></tr>' +
				'<tr><th colspan="2">31</th><th>33</th><td>34</td></tr>' +
				'</tbody>' +
				'<thead>' +
				// This row has 4 ths but it is a thead.
				'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
				'</thead>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="3" headingRows="1">' +
				'<tableRow>' +
					'<tableCell><paragraph>11</paragraph></tableCell>' +
					'<tableCell><paragraph>12</paragraph></tableCell>' +
					'<tableCell><paragraph>13</paragraph></tableCell>' +
					'<tableCell><paragraph>14</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>21</paragraph></tableCell>' +
					'<tableCell><paragraph>22</paragraph></tableCell>' +
					'<tableCell><paragraph>23</paragraph></tableCell>' +
					'<tableCell><paragraph>24</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell colspan="2"><paragraph>31</paragraph></tableCell>' +
					'<tableCell><paragraph>33</paragraph></tableCell>' +
					'<tableCell><paragraph>34</paragraph></tableCell>' +
				'</tableRow>' +
				'</table>'
			);
		} );
	} );

	describe( 'block contents', () => {
		it( 'should upcast table with empty table cell to paragraph', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>foo</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ 'foo' ]
			] ) );
		} );

		it( 'should upcast table with <p> in table cell', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td><p>foo</p></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ 'foo' ]
			] ) );
		} );

		it( 'should upcast table with multiple <p> in table cell', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>' +
								'<p>foo</p>' +
								'<p>bar</p>' +
								'<p>baz</p>' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ '<paragraph>foo</paragraph><paragraph>bar</paragraph><paragraph>baz</paragraph>' ]
			] ) );
		} );

		it( 'should upcast table with <img> in table cell to empty table cell', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td><img src="sample.png"></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ '' ]
			] ) );
		} );
	} );
} );
