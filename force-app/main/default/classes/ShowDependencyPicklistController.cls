public with sharing class ShowDependencyPicklistController {
    @AuraEnabled
    public static String getRecordTypeId(String objectName, String recordTypeName) {
        return Schema.getGlobalDescribe().get(objectName).getDescribe().getRecordTypeInfosByName().get(recordTypeName).getRecordTypeId();
    }
}