public with sharing class AccountController {
   @AuraEnabled
   public static Account getAccount() {
      return [SELECT Id, Name, LastModifiedDate FROM Account LIMIT 1];
   }
}