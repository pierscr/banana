define([
  'angular',
  'underscore'
],
function (angular, _) {
  'use strict';

  var module = angular.module('kibana.services');

  module.service('solrSrv', function(dashboard, $http, alertSrv, filterSrv, querySrv) {
    // Save a reference to this
    var self = this;

    this.MAX_NUM_CALC_FIELDS = 20; // maximum number of fields for calculating top values
    this.topFieldValues = {};

    this.getTopFieldValues = function(field) {
      return self.topFieldValues[field];
    };

    // Calculate each field top 10 values using facet query
    this.calcTopFieldValues = function(fields,limit) {
      // Check if we are calculating too many fields and show warning
      if (fields.length > self.MAX_NUM_CALC_FIELDS) {
        alertSrv.set('Warning', 'There are too many fields being calculated for top values (' + fields.length + '). This will significantly impact system performance.', 'info', 5000);
      }
      // Construct Solr query
      limit=limit || 10;
      var fq = '';
      if (filterSrv.getSolrFq()) {
        fq = '&' + filterSrv.getSolrFq();
      }
      var wt = '&wt=json';
      var facet = '&rows=0&facet=true&facet.limit='+limit+'&facet.field=' + fields.join('&facet.field=');
      var query = '/select?' + querySrv.getORquery() + fq + wt + facet;

      // loop through each field to send facet query to Solr
      // _.each(fields, function(field) {
        // var newquery = query + field;
        var request = $http({
          method: 'GET',
          url: dashboard.current.solr.server + dashboard.current.solr.core_name + query,
        }).error(function(data, status) {
          if(status === 0) {
            alertSrv.set('Error', 'Could not contact Solr at '+dashboard.current.solr.server+
              '. Please ensure that Solr is reachable from your system.' ,'error');
          } else {
            alertSrv.set('Error','Could not retrieve facet data from Solr (Error status = '+status+')','error');
          }
        });

        request.then(function(results) {
          // var topFieldValues = {
          //   counts: [],
          //   totalcount: results.data.response.numFound
          //   // hasArrays: undefined // Not sure what hasArrays does
          // };

          // var facetFields = results.data.facet_counts.facet_fields[field];
          // // Need to parse topFieldValues.counts like this:
          // //   [["new york", 70], ["huntley", 130]]
          // for (var i = 0; i < facetFields.length; i=i+2) {
          //   topFieldValues.counts.push([facetFields[i], facetFields[i+1]]);
          // };

          // self.topFieldValues[field] = topFieldValues;

          var facetFields = results.data.facet_counts.facet_fields;

          _.each(facetFields, function(values, field) {
            var topFieldValues = {
              counts: [],
              totalcount: results.data.response.numFound
              // hasArrays: undefined // Not sure what hasArrays does
            };
            // Need to parse topFieldValues.counts like this:
            //   [["new york", 70], ["huntley", 130]]
            for (var i = 0; i < values.length; i=i+2) {
              topFieldValues.counts.push([values[i], values[i+1]]);
            }

            self.topFieldValues[field] = topFieldValues;
          });

        });
      // }); // each loop
    };


    this.getFacet = function(field,limit,callback) {
      // Check if we are calculating too many fields and show warning
      // Construct Solr query
      limit=limit || 10;
      var fq = '';
      if (filterSrv.getSolrFq()) {
        fq = '&' + filterSrv.getSolrFq();
      }
      var wt = '&wt=json';
      var facet = '&rows=0&facet=true&facet.mincount=1&facet.limit='+limit+'&facet.field=' +field;
      var query = '/select?' + querySrv.getORquery() + fq + wt + facet;

      // loop through each field to send facet query to Solr
      // _.each(fields, function(field) {
        // var newquery = query + field;
        var request = $http({
          method: 'GET',
          url: dashboard.current.solr.server + dashboard.current.solr.core_name + query,
        }).error(function(data, status) {
          if(status === 0) {
            alertSrv.set('Error', 'Could not contact Solr at '+dashboard.current.solr.server+
              '. Please ensure that Solr is reachable from your system.' ,'error');
          } else {
            alertSrv.set('Error','Could not retrieve facet data from Solr (Error status = '+status+')','error');
          }
        });

        request.then(function(results) {
          // var topFieldValues = {
          //   counts: [],
          //   totalcount: results.data.response.numFound
          //   // hasArrays: undefined // Not sure what hasArrays does
          // };

          // var facetFields = results.data.facet_counts.facet_fields[field];
          // // Need to parse topFieldValues.counts like this:
          // //   [["new york", 70], ["huntley", 130]]
          // for (var i = 0; i < facetFields.length; i=i+2) {
          //   topFieldValues.counts.push([facetFields[i], facetFields[i+1]]);
          // };

          // self.topFieldValues[field] = topFieldValues;

          var facetFields = results.data.facet_counts.facet_fields;

          callback(facetFields);

        });
      // }); // each loop
    };

  });

  module.service('FileUpload', function ($http) {
      this.upload = function(params, file, success, error){
          var url = params.url+"" + params.core + "/" + params.handler + "?";
          var raw = params.raw;
          delete params.core;
          delete params.handler;
          delete params.raw;
          delete params.url;
          url += $.param(params);
          if (raw && raw.length>0) {
              if (raw[0] != "&") raw = "&" + raw;
              url += raw;
          }
          var fd = new FormData();
          fd.append('file', file);
          $http.post(url, fd, {
              transformRequest: angular.identity,
              headers: {'Content-Type': undefined}
          }).success(success).error(error);
      }
  });
});
