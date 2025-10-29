export default {
  tooltip: {
    jobBox: {
      title: 'Job Box',
      content:
        'In the Job Box, you can view all the work items created on the right side.<br /><br />Click the "Cancel Work" button to delete selected work from the job box.<br /><br />Click the "Complete Work" button to verify work results and complete standard application.',
    },
    dictionaryDetails: {
      title: 'Dictionary Registration Details',
      content:
        'This is a function for creating, modifying, and deleting standard data <br />when changes are needed to the standard dictionary managed in Mflex.',
    },
    termComposition: {
      title: 'Automatic Word Segmentation',
      content:
        'Automatically segments the entered term name into words <br/>registered in the word dictionary. <br /><br />For unregistered words, they are automatically registered in the word work box when selected.',
    },
    searchDomain: {
      title: 'Domain Search',
      content:
        'The domain search function allows you to search for domains <br />in the standard dictionary.<br /><br />Enter a search term and click the "Search" button to <br />view information about the domain classification. <br /><br />When you select a domain from the search results and save, <br />the domain information is entered in the detailed information.',
    },
    searchCodeName: {
      title: 'Integrated Code Name Search',
      content:
        'The integrated code name search function allows you to search for <br />integrated code names in the standard dictionary.<br /><br />Enter a search term and click the "Search" button to <br />view information about the code name. <br /><br />When you select an integrated code name from the search results and save, <br />the integrated code name information is entered in the detailed information.',
    },
    searchExtendStandard: {
      title: 'Other Standard Search',
      content:
        'This function allows you to search for words entered by users<br />in other standard dictionaries.<br /><br />When you select other standard words from the search results and save, <br />the other standard information is entered in the detailed information.',
    },
    searchDomainClassification: {
      title: 'Domain Classification List',
      content:
        'The domain classification list is a function that allows you to view <br />domain classifications in the standard dictionary.<br /><br />When you select a domain classification and save, <br />the domain classification information is entered in the detailed information.',
    },
    dbConnectionList: {
      title: 'DB Connection Information List',
      content:
        'The DB connection information list is a function that allows you to view <br />stored DB connection information.<br /><br />When you select DB connection information,<br />the DB connection information is displayed in the detailed information on the right.',
    },
    dbConnectionDetails: {
      title: 'DB Connection Details',
      content:
        'DB connection details is a function that allows you to view <br />detailed information of stored DB connection information.<br /><br />You can manage DB connection information through<br />add, edit, and delete functions.',
    },
    dbCollectionResultList: {
      title: 'DB Collection Result History',
      content:
        'DB collection result history is a function that allows you to view <br />tables, functions, and procedures of stored DB collection results. <br /><br />You can exclude items from collection through the collection exclusion function <br />after selecting checkboxes. <br /><br />When applying management DB, the selected collection items at the top are applied to the standardization management area.',
    },
    excludeReason: {
      title: 'Collection Exclusion Reason',
      content:
        'Collection exclusion reason is a function to enter reasons for items <br />excluded from collection in the DB collection result history.<br /><br />When you enter a collection exclusion reason and save,<br />the item is excluded from collection.',
    },
    standardizationTable: {
      title: 'Standardization Table',
      content:
        'Table refinement is a function that allows you to refine table names <br />of databases applied as management targets.<br /><br />You can collect target tables through standardization table collection.<br /><br />When you select an item in the grid and click the table refinement button, a popup for table refinement opens. <br /><br />After table refinement and saving, it is applied to the standardization management area.',
    },
    columnList: {
      title: 'Column Name List',
      content:
        'The column name list is a function that allows you to view columns <br />within tables of databases applied as management targets. <br /><br />Data such as column name, Korean name count, and refinement needed are displayed, and if refinement needed is Y, refinement is required.<br /><br />When you click the refinement execution button, a popup for setting and executing column refinement conditions is displayed.',
    },
    columnKoreanNameRefineCondition: {
      title: 'Column Name Refinement Condition Setting',
      content:
        'Column Korean name refinement condition setting is a function to set conditions <br />for refining column Korean names. <br /><br />After setting refinement conditions in the column Korean name refinement condition setting popup and clicking the refinement execution button, column Korean name refinement is executed. <br /><br />After refinement execution and saving, it is applied to the standardization management area.',
    },
    columnKoreanNameList: {
      title: 'Column Korean Name List',
      content:
        'The column Korean name list is a function that allows you to view column Korean names <br />of columns selected from the left column name list. <br /><br />Data such as column Korean name, related table count, refined column Korean name, and review content are displayed, and if the column Korean name and refined column Korean name are different, they are displayed with a red background color.',
    },
    columnKoreanNameRefine: {
      title: 'Column Korean Name Refinement',
      content:
        'Column Korean name refinement is a function that allows you to refine <br />a single item selected from the top column Korean name list. <br /><br />When you change the refined column Korean name and click save, the changed refined column Korean name is reflected. <br /><br />You can view tables related to that column through related table inquiry.',
    },
    relatedTableList: {
      title: 'Related Table List',
      content:
        'The related table list is a function that allows you to view tables <br />related to the selected column.',
    },
    termRecommendation: {
      title: 'Recommended Term Name',
      content:
        'Term name combination is a function that automatically segments the term English abbreviation name <br />entered in the detailed information into word Korean names registered in the word dictionary and recommends them. <br /><br />For unregistered words, they are automatically registered in the work box of the word standardization menu when selected. <br /><br />When you select a recommended term name and save, the recommended term name is entered in the detailed information.',
    },
    otherStandardSearch: {
      title: 'Other Standard Search',
      content:
        'The other standard search function is a function that allows you to search for words <br />entered by users in other standard dictionaries.',
    },
    diagnosisTargetTable: {
      title: 'Diagnosis Target Table',
      content:
        'Diagnosis target table is a function to select tables to diagnose <br />in the standardization management area.<br /><br />When you select a table in the diagnosis target table and save,<br />that table is set as a diagnosis target table. <br /><br />You can collect table lists by selecting target DB in the select box and collecting diagnosis target tables. <br /><br />You can exclude selected tables from diagnosis by selecting checkboxes in the table list and using the central arrow button.',
    },
    diagnosisExcludeTable: {
      title: 'Diagnosis Exclusion Table',
      content:
        'Diagnosis exclusion table is a function to view tables to be excluded <br />from diagnosis in the standardization management area.<br /><br />You can register diagnosis exclusion reasons by selecting diagnosis exclusion table items with checkboxes.<br /><br />You can include selected tables in diagnosis by selecting checkboxes in the diagnosis exclusion table list and using the central arrow button.',
    },
    diagnosisResult: {
      title: 'Standard Diagnosis Result',
      content:
        'Standard diagnosis result is a function to view tables to be excluded <br />from diagnosis in the standardization management area.<br /><br />DB and schema selection is possible, and when you select diagnosis items and execute standard diagnosis, diagnosis for the selected diagnosis items is executed.<br /><br />You can check compliance rate and recent diagnosis date/time in the grid for each diagnosis item, and check compliance rate through the bottom bar graph.',
    },
    diagnosisItemDetail: {
      title: 'Standard Diagnosis Item Details',
      content:
        "Standard diagnosis item details is a function to view detailed information <br />about diagnosis items selected in the standard diagnosis result.<br />If the status is 'error', you can identify the cause of the error in the diagnosis content.",
    },
    diagnosisHistory: {
      title: 'Standard Diagnosis History',
      content:
        'Standard diagnosis history is a function to view diagnosis history <br />for diagnosis items selected in the standard diagnosis result.<br /><br />When diagnosis is executed, selected items are sequentially stored in the history. <br /><br />You can view history for corresponding items by changing DB and schema through select boxes, <br />and the right diagnosis item trend changes.',
    },
    diagnosisTrend: {
      title: 'Standard Diagnosis Item Trend',
      content:
        'Diagnosis item trend is a function to view trends for diagnosis items <br />of DB/schema selected in the standard diagnosis history.<br /><br />You can check the compliance rate of diagnosis items by date through line graphs.',
    },
    instituteList: {
      title: 'Institute List',
      content:
        'The institute list is a function that allows you to view institutes managed in Mflex <br />in a hierarchical tree structure. <br /><br />When you select an institute list, you can view detailed information of the selected institute in the right detailed information.<br /><br />You can set items in the institute list as sub-institutes of other institutes by dragging them.',
    },
    instituteDetails: {
      title: 'Institute Details',
      content:
        'Institute details is a function to view detailed information of the selected institute. <br /><br />You can enter information such as institute name, meta management institute status, parent institute, and institute description, <br /><br />and manage institute information through add, edit, and delete functions.',
    },
    dictionaryList: {
      title: 'Dictionary List',
      content:
        'The dictionary list is a function that allows you to view information about dictionaries <br />assigned to institutes in a hierarchical tree structure. When the selected institute changes, the dictionary list belonging to that institute is displayed.<br /><br />When you select a dictionary list, you can view detailed information of the selected dictionary in the right detailed information.<br /><br />You can set items in the dictionary list as sub-dictionaries of other institutes by dragging them.',
    },
    dictionaryItemDetails: {
      title: 'Dictionary Details',
      content:
        'Dictionary details is a function to view detailed information of the dictionary <br />selected from the dictionary list. <br /><br />You can enter information such as dictionary name, dictionary type, dictionary description, and dictionary icon, <br /><br />and manage dictionary information through add, edit, and delete functions.',
    },
    informationSystemList: {
      title: 'Information System List',
      content:
        'The information system list is a function that allows you to view information <br />about information systems assigned to institutes in a hierarchical tree structure. <br /><br />When you select an information system list, you can view detailed information of the selected information system in the right detailed information.',
    },
    informationSystemDetails: {
      title: 'Information System Details',
      content:
        'Information system details is a function to view detailed information of the information system <br />selected from the information system list. <br /><br />You can enter information such as information system name, standard dictionary application status, applied standard dictionary name, and system description. When standard dictionary application status is selected, you must select the applied standard dictionary. <br /><br />You can manage information system information through add, edit, and delete functions.',
    },
    databaseList: {
      title: 'Database List',
      content:
        'The database list is a function that allows you to view information <br />about databases assigned to information systems. <br /><br />When you select a database list, you can view detailed information of the selected database in the right detailed information. <br /><br />You can view database lists belonging to institutes through institute changes.',
    },
    databaseDetails: {
      title: 'Database Details',
      content:
        'Database details is a function to view detailed information of the database <br />selected from the database list. <br /><br />You can enter information such as logical/physical database name, DBMS type, and DB description, <br /><br />and manage database information through add, edit, and delete functions.',
    },
    schemaList: {
      title: 'Schema List',
      content:
        'The schema list is a function that allows you to view schema lists <br />assigned to databases. <br /><br />You can add schemas to databases through the add button, <br /><br />and delete selected schemas through the delete button.',
    },
    relatedDatabaseSchema: {
      title: 'Linked Database-Schema',
      content:
        'Linked database-schema is a function that allows you to view databases and schemas <br />linked to information systems. <br /><br />You can change databases and schemas mapped to systems through the edit function.',
    },
    externalDictionaryList: {
      title: 'External Dictionary List',
      content:
        'The external dictionary list is a function that allows you to view external dictionary lists <br />managed in Mflex. <br /><br />When you select an external dictionary list, you can view detailed information of the selected external dictionary in the right detailed information. <br /><br />Discarded external dictionary items are displayed with red strikethrough.',
    },
    externalDictionaryDetails: {
      title: 'External Dictionary Details',
      content:
        'External dictionary details is a function to view detailed information of the external dictionary <br />selected from the external dictionary list. <br /><br />You can enter information such as external dictionary name, external dictionary type, and external dictionary description, <br /><br />and manage external dictionary information through add, edit, discard, restore, and delete functions.',
    },
    externalDictionaryInstitutionList: {
      title: 'External Dictionary List by Institute',
      content:
        "The external dictionary list by institute is a function that allows you to view external dictionary lists <br />assigned to institutes in a hierarchical tree structure. Institute changes are possible through select boxes.<br /><br />When you select an item in the external dictionary list by institute, you can view detailed information of the selected institute's external dictionary in the right detailed information.<br /><br />You can set items in the external dictionary list by institute as sub-institutes of other institutes by dragging them.",
    },
    externalDictionaryInstitutionDetails: {
      title: 'External Dictionary Details by Institute',
      content:
        "External dictionary details by institute is a function to view detailed information of the institute's external dictionary <br />selected from the external dictionary list by institute. <br /><br />You can enter information such as institute name, external dictionary name, parent external dictionary name, and external dictionary description, <br /><br />and manage external dictionary information by institute through add, edit, and delete functions.",
    },
    externalDictionaryVersionList: {
      title: 'External Dictionary Version List',
      content:
        'The external dictionary version list is a function that allows you to view versions <br />of external dictionaries. <br /><br />When you select an external dictionary version list, you can view detailed version information of the selected external dictionary in the right detailed information.<br /><br />You can apply the selected external dictionary version to the management dictionary through management dictionary application. <br /><br />Items already applied as management dictionaries cannot be reapplied.',
    },
    externalDictionaryVersionDetails: {
      title: 'External Dictionary Details',
      content:
        'External dictionary version details is a function to view detailed information of the external dictionary <br />selected from the external dictionary version list. <br /><br />You can view information about terms, words, and domains uploaded to the external dictionary version. <br /><br />You can upload external dictionary files through the external dictionary file upload button.',
    },
    topInstituteList: {
      title: 'Primary Institute List',
      content:
        'The Primary Institute List allows you to view the top-level institutes managed in Mflex. <br /><br />By selecting an institute, you can view and add institute administrators in the details section on the right.',
    },
    instituteAdminDetails: {
      title: 'Primary Institute Details',
      content:
        'The Primary Institute Details function allows you to view detailed information of an institute selected from the Primary Institute List. <br /><br />You can manage primary institute administrators by adding or removing them from the administrator list.',
    },
    userStatus: {
      title: 'User Status',
      content:
        'The User Status function allows you to view the list of users managed in Mflex. <br /><br />When you select a user from the list, you can view detailed information of the selected user on the right. <br />You can create users using the Add button. <br /><br />Status Information: <br /><br />🌰 (Seed): Not approved <br />🌱 (Sprout): Approved but password not reset <br />🌳 (Tree): Approved, password reset completed, and activated (service available) <br />🍂 (Fallen Leaves): Approved, password reset completed, but deactivated (service unavailable) <br /><br />If an account is locked, you can unlock it by clicking the icon. <br /><br />You can also view user details and allocate resources through the detail view.',
    },
    approvalList: {
      title: 'Approval Line List',
      content:
        'The Approval Line List function allows you to view the approval lines managed in Mflex. <br /><br />When you select an approval line from the list, you can view its details on the right. <br />You can create a new approval line using the Add button. <br />You can also delete an approval line using the Delete button.',
    },
    approvalDetails: {
      title: 'Approval Line Details',
      content:
        'The Approval Line Details function allows you to view the detailed information of an approval line selected from the list. <br /><br />You can edit the approval line name, add approvers, change the order of approvers, delete approvers, and configure whether the approval line is active or not.',
    },
  },
  common: {
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
  },
  error: {
    unknownError: 'An unknown error occurred.<br>Please try again later.',
    networkError: 'A network error occurred.',
    validationError: 'Please check the input information.',
  },
};
