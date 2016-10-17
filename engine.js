'use strict';

return function ()
{
    var handlebarsCache = {};

    // Creates a handlebars provider which is specific for the given context
    var getHandlebars = function (componentsPath, context, extension)
    {
        var key = JSON.stringify(context)

        if (!handlebarsCache[key])
        {
            handlebarsCache[key] = require('./handlebars-provider')(context, componentsPath, extension);
        }

        return handlebarsCache[key];
    };

    // Renders the given view with the given model
    this.render = function (componentsPath, context, layout, model)
    {
        var html = null;

        try
        {
            var parts = layout.split('.');
            var ext = parts[parts.length - 1];

            if (ext === 'hbs')
            {
                var hbs = getHandlebars(componentsPath, context, ext);

                html = hbs.render(layout, model);
            }
            else if (ext === 'pug')
            {
                var pug = require('./pug-provider')(componentsPath, context, ext);

                html = pug.render(layout, model);
            }
            else
            {
                throw 'The extension type ' + ext + ' is not supported.';
            }
        }
        catch (ex)
        {
            html = ex.toString();
        }

        return html;
    };

    return function (data, callback)
    {
        var html = this.render(data.componentsPath, data.context, data.layout, data.model);

        callback(null, html);
    }
}();