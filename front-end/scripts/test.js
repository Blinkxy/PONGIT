// Define a class
class TestClass {
	constructor(name, value) {
	  this.name = name;
	  this.value = value;
	}
  
	// A method to display information
	getInfo() {
	  return `Name: ${this.name}, Value: ${this.value}`;
	}
  }
  
  // Create an instance of the class
  const testInstance = new TestClass("ExampleName", 42);
  
  // Export the instance
  export { testInstance };