({
   init : function (component) {
      // Create action to find an account
      var action = component.get("c.getAccount");

      // Add callback behavior for when response is received
      action.setCallback(this, function(response) {
         if (state === "SUCCESS") {
            // Pass the account data into the component's account attribute 
            component.set("v.account", response.getReturnValue());
            // Find the component whose aura:id is "flowData"
            var flow = component.find("flowData");
            // Set the account record (sObject) variable to the value of the component's 
            // account attribute.
            var inputVariables = [
               {
                  name : "account",
                  type : "SObject",
                  value: component.get("v.account")
               }
            ];
      
            // In the component whose aura:id is "flowData, start your flow
            // and initialize the account record (sObject) variable. Reference the flow's
            // API name.
            flow.startFlow("My_Flow", inputVariables);
            debug.log("success");
         }
         else {
            debug.log("Failed to get account date.");
         }
      });

      // Send action to be executed
      $A.enqueueAction(action);
   }
})