'use strict';

angular.module('mean', ['ngCookies', 'ngResource', 'ngRoute', 'ui.bootstrap', 'ui.route', 'mean.system', 'mean.directives', 'mean.filters', 'mean.procedimientos', 'mean.categorias','ui.select2','textAngular');

angular.module('mean.system', []);

angular.module('mean.procedimientos', ['ui.select2','textAngular']).
config(function($provide){
        // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['$delegate', function(taOptions){
            // $delegate is the taOptions we are decorating
            // here we change taOptions to be the default of taOptions for example
            taOptions = {
                toolbar: [
                    ['h1', 'h2', 'p', 'pre','bold', 'italics', 'underline',
                    'ul', 'ol','insertLink','redo', 'undo']
                ],
                classes: {
                    focussed: 'focussed',
                    toolbar: 'btn-toolbar',
                    toolbarGroup: 'btn-group',
                    toolbarButton: 'btn-sm btn-default',
                    toolbarButtonActive: 'active',
                    disabled: 'disabled',
                    textEditor: 'height-textarea form-control',
                    htmlEditor: 'form-control'
                },
                setup: {
                    // wysiwyg mode
                    textEditorSetup: function(element){
                        element.triggerHandler('focus');
                    },
                    // raw html
                    htmlEditorSetup: function(element){
                        element.triggerHandler('focus');
                    }
                }
            };
            return taOptions; // whatever you return will be the taOptions
        }]);
    });

angular.module('mean.categorias', []);
