'use strict';
/**
 * Truncate Filter
 * @Param text
 * @Param length, default is 10
 * @Param end, default is '...'
 * @return string
 */
angular.module('mean.filters', []).
    filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = '...';

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    })
    .filter('notags', function () {
        return function (text) {
                return String(text).replace(/<h1>/g,' ')
                .replace(/<span>/g,' ')
                .replace(/<b>/g,' ')
                .replace(/<pre>/g,' ')
                .replace(/<div>/g,' ')
                .replace(/<h2>/g,' ')
                .replace(/<li>/g,' ')
                .replace(/<ul>/g,' ')
                .replace(/<ol>/g,' ')
                .replace(/<p>/g,' ')
                .replace(/<i>/g,' ')
                .replace(/<u>/g,' ')
                .replace(/<a>/g,' ')
                .replace(/<span[^>]+>/g,' ')
                .replace(/<pre[^>]+>/g,' ')
                .replace(/<div[^>]+>/g,' ')
                .replace(/<h2[^>]+>/g,' ')
                .replace(/<li[^>]+>/g,' ')
                .replace(/<ul[^>]+>/g,' ')
                .replace(/<ol[^>]+>/g,' ')
                .replace(/<b[^>]+>/g,' ')
                .replace(/<p[^>]+>/g,' ')
                .replace(/<i[^>]+>/g,' ')
                .replace(/<u[^>]+>/g,' ')
                .replace(/<a[^>]+>/g,' ')
                .replace(/&#[^;]+;/g,' ')
                .replace(/<\/span>/g,' ')
                .replace(/<\/div>/g,' ')
                .replace(/<\/pre>/g,' ')
                .replace(/<\/h1>/g,' ')
                .replace(/<\/h2>/g,' ')
                .replace(/<\/li>/g,' ')
                .replace(/<\/ul>/g,' ')
                .replace(/<\/ol>/g,' ')
                .replace(/<\/b>/g,' ')
                .replace(/<\/i>/g,' ')
                .replace(/<\/u>/g,' ')
                .replace(/<\/a>/g,' ')
                .replace(/<\/p>/g,' ');
            };
    });
