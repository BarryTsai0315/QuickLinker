// jest.setup.js
global.chrome = {
  runtime: {
    onInstalled: { addListener: jest.fn() },
    onMessage: { addListener: jest.fn() },
    sendMessage: jest.fn(),
  },
  contextMenus: {
    removeAll: jest.fn((cb) => cb()),
    create: jest.fn(),
    onClicked: { addListener: jest.fn() },
  },
  storage: {
    sync: {
      get: jest.fn((keys, cb) => {
        // Mock storage data here
        const mockData = {
          settings: [
            { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
            { id: 'site2', name: 'Test Site 2', versions: [{ id: 'v2', name: 'Default', baseUrl: 'https://test.com/{}' }] },
          ],
          scanMode: 'bestMatch',
        };
        if (typeof keys === 'string') {
          cb({ [keys]: mockData[keys] });
        } else if (Array.isArray(keys)) {
          const result = {};
          keys.forEach(key => {
            if (mockData[key]) result[key] = mockData[key];
          });
          cb(result);
        } else {
          cb(mockData);
        }
      }),
      set: jest.fn((data, cb) => {
        // Simulate setting data
        if (cb) cb();
      }),
    },
    onChanged: { addListener: jest.fn() },
  },
  tabs: {
    create: jest.fn(),
  },
};

// Mock fetch API for background.js
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    url: 'https://example.com/final',
    json: () => Promise.resolve({}),
  })
);

// Mock URL for content.js
global.URL = jest.fn((url) => ({
  hostname: new URL(url).hostname,
  toString: () => url,
}));

// Mock MutationObserver for content.js
global.MutationObserver = jest.fn(function(callback) {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
  this.takeRecords = jest.fn();
});

// Mock prompt and confirm for popup.js
global.prompt = jest.fn((message, defaultValue) => defaultValue);
global.confirm = jest.fn(() => true);

// Mock FileReader for popup.js
global.FileReader = jest.fn(function() {
  this.readAsText = jest.fn();
  this.onload = null;
});

// Mock Blob for popup.js
global.Blob = jest.fn(function(content, options) {
  this.content = content;
  this.options = options;
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement for popup.js
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName) => {
  const element = originalCreateElement.call(document, tagName);
  if (tagName === 'a') {
    element.click = jest.fn();
  }
  return element;
});

// Mock getSelection for content.js
global.window.getSelection = jest.fn(() => ({
  toString: jest.fn(() => ''),
}));
