const fs = require('fs');
const _ = require('lodash');
const hbs = require('handlebars');

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
            var template = fs.readFileSync(path, 'utf8');

            compiledTemplates[key] = hbs.compile(template);
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

    hbs.registerHelper('markdown', (text, options) => new hbs.SafeString(text));

    hbs.registerHelper('price', (value, currency, options) => new hbs.SafeString([value.toString(), ' ', currency].join(' ')));

    hbs.registerHelper('partial', (src, model, options) =>
    {
        var data = getModel(model, options);

        src = [src, '.', extension].join('');

        var template = getCompiledTemplate(src);

        return new hbs.SafeString(template(data));
    });

    hbs.registerHelper('component', (id, version, model, options) =>
    {
        var data = getModel(model, options);

        var src = [id, '/v', version, '/view.', extension].join('');

        var template = getCompiledTemplate(src);

        return new hbs.SafeString(template(data));
    });

    hbs.registerHelper('render', (json, options) =>
    {
        var data = getModel(model, options);

        var src = [json.name, '/v', json.version, '/view.', extension].join('');

        var template = getCompiledTemplate(src);

        return new hbs.SafeString(template(data));
    });

    hbs.registerHelper('asset', (src, options) =>
    {
        var url = '//cdn.logitravel.com';

        return new hbs.SafeString(url + src);
    });

    hbs.registerHelper('random', (model, options) =>
    {
        var low = 0;
        var high = 9999;

        var random = 'r' + (Math.random() * (high - low) + low);

        return new hbs.SafeString(random);
    });

    hbs.registerHelper('exists', (item, options) => item ? true : false);

    hbs.registerHelper('inArray', (array, value, options) => array.includes(value));

    hbs.registerHelper('count', (item, options) => item.length);

    hbs.registerHelper('is', (v1, op, v2, options) =>
    {
        return {
            '&&': () => v1 && v2
            , '||': () => v1 || v2
        }[op]();
    });

    hbs.registerHelper('compare', (v1, op, v2, options) =>
    {
        return {
            '==': () => v1 == v2
            , '!=': () => v1 != v2
            , '===': () => v1 === v2
            , '!==': () => v1 !== v2
            , '<': () => v1 < v2
            , '<=': () => v1 <= v2
            , '>': () => v1 > v2
            , '>=': () => v1 >= v2
        }[op]();
    });

    hbs.registerHelper('math', (lvalue, op, rvalue, options) =>
    {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
            '+': () => lvalue + rvalue
            , '-': () => lvalue - rvalue
            , '*': () => lvalue * rvalue
            , '/': () => lvalue / rvalue
            , '%': () => lvalue % rvalue
        }[operator]();
    });

    hbs.registerHelper('increment', (integer, options) => (integer + 1));

    // Renders the given view with the given model
    this.render = function (layout, model)
    {
        model = getModel(model);

        var template = getCompiledTemplate(layout);

        var html = template(model);

        return html;
    };
}