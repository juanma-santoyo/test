const fs = require('fs');
const _ = require('lodash');
const pug = require('pug');

module.exports = (componentsPath, context, extension) =>
{
    var compiledTemplates = {};

    // Caches compiled templates by file path and last modification time 
    var getCompiledTemplate = (src) =>
    {
        var path = [componentsPath, src].join('');
        var stat = fs.statSync(path);

        // The cache key, based in src and last modification time
        var key = [src, stat.mtime.toISOString()].join();

        var compiled = compiledTemplates[key];

        if (!compiled)
        {
            compiledTemplates[key] = pug.compileFile(path);
        }

        return compiled;
    };

    // Builds a model object, the way our views like
    var getModel = (model, options) =>
    {
        var data = {
            Model: model
        };

        if (options && options.hash)
        {
            data.Model = _.merge(data.Model, options.hash);
        }

        return data;
    };

    // Renders the given view with the given model
    this.render = function (layout, model)
    {
        model = getModel(model);

        var template = getCompiledTemplate(layout);

        var html = template(model);

        return html;
    };
}