# Excel2Word


![Banner](./reference/banner.png)

Excel2Word is a simple electron app that takes column based entries in an excel worksheet and runs them through a word template, generating single and multi-page word documents depending on your configuration. This is still in early development so if you find a bug or major missing feature, please file an issue! Thanks!

## Why build an app?
If you are not in a situation where your office files NEED to live off-line, I would highly recommend pursuing a solution built with the modern Office.js library. All of the features present can be recreated entirely in office. This is only helpful for those who need off-line excel parsing.

## Documentation

The app workflow consists of a total of four steps.
1.  Upload a file.
2.  Choose which sheets you want to process and set configuration options.
3.  Choose a word template to use.
4.  Hit the export button!

The first two steps look like this:

![Screenshot](./reference/app-screens-1.png)

In screenshot **a)**, you can import an excel document.
In **b)**, you select which sheets you want to process. As my sheet reflects an invoice utility, I am renaming the first sheet to *invoices* which I will then reference in my word template. Since I will be reusing the template often, it is easier to rename the data set here as opposed to renaming my word document syntax each time.
At screen **c)** I am telling the processor that my data is not serialized, which will make the reference values in my left-hand column available globally in my template. This will make more sense when we get to templating.

There is optional support for adding a JSON schema file for customizing the maping of data. Again, this will make more sense when we get to templating.

For reference, here is the excel document being parsed:

![Screenshot](./reference/excel_1.png)
![Screenshot](./reference/excel_2.png)

Now we have our sheets imported, it's time to confirm our data is processed and ready for export. Here's how that looks:

![Screenshot](./reference/app-screens-2.png)

In screenshot **a)**, you can pick which columns you want to view. Notice the red gear in the bottom left corner, you can always change your column headers here.
In **b)** you will choose a word document with the embeded syntax to act as our template.
At screen **c)** My documents are uploaded, I've verified the data is present and I am ready for export!

### Templating

By default, the names of each worksheet in the excel file contains an array of serialized data for looping over. Each row of data takes the furthest left (column A or C1) value as it's entry. For example, if you look at the first excel sheet, there is a label called "Creative Count" - this will get cleaned and processed to be "creative_count" instead. In my template, I would use the handlebars inspired tag method `{creative_count}`. Anything ommited from the JSON file simple gets discarded.

If I provided a JSON schema with the following syntax:

```JSON
{
	"creative": {
		"count": "creative_count",
		"cost": "creative_cost"
	}
}
```

then my data would be available in the template as `{creative.count}` and `{creative.cost}` respectively. This is helpful when working with multiple international files where the labels might change in name so you can maintain unique schema documents but keep one master word document for maintaining style and brand.

Here's an example of how that looks:

![Screenshot](./reference/syntax.png)

The library for processing the word document is called [Docxtemplater](https://docxtemplater.com/) and it has extensive documentation on the [supported syntax](https://docxtemplater.readthedocs.io/en/latest/syntax.html). The angular expressions plugin is also implemented, so you can use almost all the syntax helpers found at this [angular expressions cheat-sheet](https://teropa.info/blog/2014/03/23/angularjs-expressions-cheatsheet.html).

The essential syntax to loop over the array of entries is called *loop syntax*, in the case of my invoices data, it looks like this: `{#invoices} {/invoices}` - any data you reference between these brackets such as my `{creative_count}` value will refer to the immediate scope of that column of data. Examples are in the reference folder.

Here's an example of my word template:

![Screenshot](./reference/word_1.png)

Notice that my closing `{/invoices}` tag is actually on the next page after a pagebreak, that enforces that each invoice gets its own page.


## License

[MIT License](http://opensource.org/licenses/mit-license.php)
