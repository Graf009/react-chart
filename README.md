# react-chart

> D3.js with React

### Examples

```js
<Chart
  type="multiLine"
  width={420}
  height={400}
  margin={{ top: 10, right: 40, bottom: 40, left: 60 }}
  marginBrush={30}
  heightBrush={50}
  showTooltips
  data={
    {
      "RU": [{
        "date": 1435708800000,
        "value": 500,
      }, {
        "date": 1435968000000,
        "value": 292,
      },
      ],
      "EN": [{
        "date": 1435708800000,
        "value": 400,
      }, {
        "date": 1435968000000,
        "value": 192,
      },
      ],
    }
  }
/>
```

### Chart type

* `multiLine`
* `multiTable`
* `line`
* `table`
* `bar`
