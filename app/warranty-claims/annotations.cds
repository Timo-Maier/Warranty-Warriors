using ClaimService as service from '../../srv/claim-service';

annotate service.Reports with @(Capabilities.FilterRestrictions : {
    RequiredProperties : [
        caseDescription
    ]
});

annotate service.Reports with @(
    UI.SelectionFields : [
        caseDescription
    ],
    UI.HeaderInfo : {
        TypeName : 'Report',
        TypeNamePlural : 'Reports',
        Title : {
            $Type : 'UI.DataField',
            Value : caseId,
        },
        Description : {
            $Type : 'UI.DataField',
            Value : caseDescription,
        },
    },
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : caseId,
            Label : 'Case ID',
        },
        {
            $Type : 'UI.DataField',
            Value : caseDescription,
            Label : 'Description',
        },
        {
            $Type : 'UI.DataField',
            Value : matNrMH,
            Label : 'Material Nr. (MH)',
        },
        {
            $Type : 'UI.DataField',
            Value : matNrCust,
            Label : 'Material Nr. (Customer)',
        },
        {
            $Type : 'UI.DataField',
            Value : claimsCount,
            Label : 'Claims Count',
        },
    ],
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'ReportDetailsFacet',
            Label : 'Report Details',
            Target : '@UI.FieldGroup#ReportDetails',
        },
    ],
    UI.FieldGroup #ReportDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : caseId,
                Label : 'Case ID',
            },
            {
                $Type : 'UI.DataField',
                Value : caseDescription,
                Label : 'Description',
            },
            {
                $Type : 'UI.DataField',
                Value : matNrMH,
                Label : 'Material Nr. (MH)',
            },
            {
                $Type : 'UI.DataField',
                Value : matNrCust,
                Label : 'Material Nr. (Customer)',
            },
            {
                $Type : 'UI.DataField',
                Value : claimsCount,
                Label : 'Claims Count',
            },
        ],
    },
);
