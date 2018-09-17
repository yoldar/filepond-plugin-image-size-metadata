/*
 * FilepondPluginImageSizeMetadata 1.0.1
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://github.com/yoldar/filepond-plugin-image-size-metadata for details.
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
      ? (module.exports = factory())
      : typeof define === 'function' && define.amd
        ? define(factory)
        : (global.FilepondPluginImageSizeMetadata = factory());
  })(this, function() {
    'use strict';
  
    // test if file is of type image
    var isImage = function isImage(file) {
        return /^image/.test(file.type);
    };
    
    var getImageSize = function getImageSize(file) {
        return new Promise(function(resolve, reject) {
            var image = document.createElement('img');
            image.src = URL.createObjectURL(file);
            image.onerror = function(err) {
                clearInterval(intervalId);
                reject(err);
            };
            var intervalId = setInterval(function() {
                if (image.naturalWidth && image.naturalHeight) {
                    clearInterval(intervalId);
                    URL.revokeObjectURL(image.src);
                    resolve({
                        width: image.naturalWidth,
                        height: image.naturalHeight
                    });
                }
            }, 1);
        });
    };

    /**
     * Read Image Orientation Plugin
     */
    var plugin$1 = function(_) {
      var addFilter = _.addFilter,
        utils = _.utils;
      var Type = utils.Type,
        isFile = utils.isFile;
  
      // subscribe to file load and append required info
  
      addFilter('DID_LOAD_ITEM', function(item, _ref) {
        var query = _ref.query;
        return new Promise(function(resolve, reject) {
          // get file reference
          var file = item.file;
  
          if (
            !isFile(file) ||
            !isImage(file) ||
            !query('GET_ALLOW_IMAGE_SIZE_METADATA')
          ) {
            // continue with the unaltered dataset
            return resolve(item);
          }
  
          // get orientation from exif data
          getImageSize(file).then(function(size) {
            item.setMetadata('size', {
                width: size.width,
                height: size.height,
            });
  
            resolve(item);
          });
        });
      });
  
      // Expose plugin options
      return {
        options: {
          // Enable or disable image size metadata
          allowImageSizeMetadata: [true, Type.BOOLEAN]
        }
      };
    };
  
    if (typeof navigator !== 'undefined' && document) {
      // plugin has loaded
      document.dispatchEvent(
        new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
      );
    }
  
    return plugin$1;
  });