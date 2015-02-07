/*
	@license Angular Treeview version 0.1.6
	ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
	contribution of Helder Castrillón
	License: MIT


	[TREE attribute]
	angular-treeview: the treeview directive
	tree-id : each tree's unique id.
	tree-model : the tree model on $scope.
	node-id : each node's id
	node-label : each node's label
	node-children: each node's children
	data-tree-type : change the tree type to single or multi-select

	<div
		data-angular-treeview="true"
		data-tree-id="tree"
		data-tree-model="roleList"
		data-node-id="roleId"
		data-node-label="roleName"
		data-node-children="children"
		data-tree-type="single or multiple" 
	</div>
*/

(function ( angular ) {
	'use strict';

	angular.module( 'angularTreeview', [] ).directive( 'treeModel', ['$compile', function( $compile ) {
		return {
			restrict: 'A',
			link: function ( scope, element, attrs ) {
				//tree id
				var treeId = attrs.treeId;
			
				//tree model
				var treeModel = attrs.treeModel;
				
				//tree model
				var treeType = attrs.treeType;

				//node id
				var nodeId = attrs.nodeId || 'id';

				//node label
				var nodeLabel = attrs.nodeLabel || 'label';

				//children
				var nodeChildren = attrs.nodeChildren || 'children';
           				
				 if(treeType=="multiple"){
					 var check='<input id="node.' + nodeId +'" type="checkbox" data-ng-checked="selectionscope['+treeId+'].multiSelectNode.indexOf(node.' + nodeId +') > -1" data-ng-click="' + treeId + '.multiselectNode(node)" />';
				  }
				 else{
					var check=""; 
				 }
				 //tree template
				var template =
					'<ul>' +
						'<li data-ng-repeat="node in ' + treeModel + '">' +
							'<i class="collapsed" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
							'<i class="expanded" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
							'<i class="normal" data-ng-click="' + treeId + '.selectNodeLabel(node)" data-ng-hide="node.' + nodeChildren + '.length"></i> ' + check +
							'<span data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)"> {{node.' + nodeLabel + '}}</span>' +
							'<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + ' data-tree-type='+treeType+'></div>' +
						'</li>' +
					'</ul>';


				//check tree id, tree model
				if( treeId && treeModel ) {

					//root node
					if( attrs.angularTreeview ) {
					
						//create tree object if not exists
						scope[treeId] = scope[treeId] || {};
						scope[treeId].listNodesSelected=[];
						
						//if node head clicks,
						scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode ){

							//Collapse or Expand
							selectedNode.collapsed = !selectedNode.collapsed;
						};

						//if node label  check
						scope[treeId].multiselectNode = scope[treeId].multiselectNode || function( selectedNode ){
							
							var idx = scope[treeId].listNodesSelected.indexOf(selectedNode);
							// is currently selected
							if (idx > -1) {
								scope[treeId].listNodesSelected.splice(idx, 1);
							}
							// is newly selected
							else {
								//set multiple Nodes Selected
								scope[treeId].listNodesSelected.push(selectedNode);
							}
						};
						
						
						//if node label clicks,
						scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode ){

							//remove highlight from previous node
							if( scope[treeId].currentNode && scope[treeId].currentNode.selected ) {
								scope[treeId].currentNode.selected = undefined;
							}

							//set highlight to selected node
							selectedNode.selected = 'selected';

							//set currentNode
							scope[treeId].currentNode = selectedNode;							
							
						};
					}

					//Rendering template.
					element.html('').append( $compile( template )( scope ) );
				}
			}
		};
	}]);
})( angular );
