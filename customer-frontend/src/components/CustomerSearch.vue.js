import { defineComponent } from 'vue';
import axios from 'axios';
export default defineComponent({
    name: 'CustomerSearch',
    data() {
        return {
            search: {
                name: '',
                phone: '',
            },
            customers: [],
            error: null,
            searched: false,
        };
    },
    computed: {
        tenantId() {
            return '6fb59d40-20f1-4545-a418-831ecd24484e';
        },
    },
    methods: {
        async searchCustomer() {
            this.error = null;
            this.searched = false;
            this.customers = [];
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tenants/${this.tenantId}/customers`, {
                    params: {
                        search: this.search.name,
                        phone: this.search.phone,
                    },
                });
                this.customers = response.data;
                this.searched = true;
            }
            catch (error) {
                const err = error;
                this.error = `Failed to search customers: ${err.message} (Stack: ${err.stack})`;
            }
        },
    },
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['results']} */ ;
/** @type {__VLS_StyleScopedClasses['results']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.searchCustomer) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "name",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "name",
    value: (__VLS_ctx.search.name),
    type: "text",
    placeholder: "Enter your name",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "phone",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "phone",
    type: "tel",
    placeholder: "Enter your phone number",
    required: true,
});
(__VLS_ctx.search.phone);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error" },
    });
    (__VLS_ctx.error);
}
if (__VLS_ctx.customers.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "results" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    for (const [customer] of __VLS_getVForSourceType((__VLS_ctx.customers))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (customer.customerId),
        });
        const __VLS_0 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            to: (`/customer/${__VLS_ctx.tenantId}/${customer.customerId}`),
        }));
        const __VLS_2 = __VLS_1({
            to: (`/customer/${__VLS_ctx.tenantId}/${customer.customerId}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_3.slots.default;
        (customer.name);
        (customer.phone);
        var __VLS_3;
    }
}
else if (__VLS_ctx.searched && __VLS_ctx.customers.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-results" },
    });
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['results']} */ ;
/** @type {__VLS_StyleScopedClasses['no-results']} */ ;
var __VLS_dollars;
let __VLS_self;
