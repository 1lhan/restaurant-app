import { useQuery } from "@tanstack/react-query";
import { useFormatDate, usePostRequest } from "../utils";
import { batch, useSignal } from "@preact/signals-react";
import Form from "../components/Form";
import Table from "../components/Table";

export default function Staff({ user }) {
    const showAddStaffForm = useSignal(false)
    const showStaffInfo = useSignal(-1)
    const addStaffFormMsg = useSignal('')

    const { data: staff, refetch: refetchStaff } = useQuery({
        queryKey: ['getStaff'],
        queryFn: async () => {
            let _staff = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-staff').then(res => res.json())
            return _staff.success ? _staff.staff : []
        }
    })

    const addStaff = async (e) => {
        let { name: { value: name }, lastname: { value: lastname }, gender: { value: gender }, ["phone-number"]: { value: phoneNumber }, ["identification-number"]: { value: identificationNumber },
            role: { value: role }, salary: { value: salary }, ["start-date"]: { value: startDate } } = e.target.elements

        if (name.length <= 1) addStaffFormMsg.value = 'The name must be at least 2 characters long.'
        else if (lastname.length <= 1) addStaffFormMsg.value = 'The lastname must be at least 2 characters long.'
        else if (gender == '') addStaffFormMsg.value = 'The gender field cannot be empty.'
        else if (phoneNumber.length != 11) addStaffFormMsg.value = 'The phone number must be 11 characters long.'
        else if (identificationNumber.length != 11) addStaffFormMsg.value = 'The identification number must be 11 characters long.'
        else if (role == '') addStaffFormMsg.value = 'The role field cannot be empty.'
        else if (salary == '') addStaffFormMsg.value = 'The salary field cannot be empty.'
        else {
            let _add = await usePostRequest('/add-staff', { name, lastname, gender, phoneNumber, identificationNumber, role, salary, startDate: startDate == '' ? new Date() : new Date(startDate) })
            if (_add.success) {
                e.target.reset()
                refetchStaff()
            }
            addStaffFormMsg.value = _add.success ? 'New staff member has been successfully added' : 'New staff member could not be added'
        }
    }

    const StaffInfoDiv = () => {
        let _staff = staff[showStaffInfo]

        const updateSalary = async (e) => {
            e.preventDefault()

            let salary = e.target.salary.value

            if (!confirm(`Are you sure you want that update salary from ${_staff.salary[0].salary} to ${salary} \nid:${showStaffInfo + 1}, name:${_staff.name}, lastname:${_staff.lastname}`)) return false

            let _update = await usePostRequest('/update-salary', { id: _staff._id, salary: +salary, date: new Date() })
            if (_update.success) {
                refetchStaff()
            }
            alert(_terminate.success ? 'The staff member salary has been updated' : 'The staff member salary could not be updated')
        }

        const terminateStaffMember = async () => {
            if (!confirm(`Are you sure you want that terminate staff member \nid:${showStaffInfo + 1}, name:${_staff.name}, lastname:${_staff.lastname}`)) return false

            let _terminate = await usePostRequest('/terminate-staff-member', { id: _staff._id, date: new Date() })
            if (_terminate.success) {
                showStaffInfo.value = -1
                refetchStaff()
            }
            alert(_terminate.success ? 'The staff member has been terminated' : 'The staff member could not be terminated')
        }

        const deleteStaffMember = async () => {
            if (!confirm(`Are you sure you want that delete staff member \nid:${showStaffInfo + 1}, name:${_staff.name}, lastname:${_staff.lastname}`)) return false

            let _delete = await usePostRequest('/delete-staff-member', { id: _staff._id })
            if (_delete.success) {
                showStaffInfo.value = -1
                refetchStaff()
            }
            alert(_terminate.success ? 'The staff member has been deleted' : 'The staff member could not be deleted')
        }

        return (
            <div className="staff-info-div">
                <i className="fa-solid fa-xmark small-btn" onClick={() => showStaffInfo.value = -1} />
                <div className="staff-info-children-div">
                    <span>ID</span>
                    <span>{showStaffInfo + 1}</span>
                </div>
                <div className="staff-info-children-div">
                    <span>Name</span>
                    <span>{_staff.name}</span>
                </div>
                <div className="staff-info-children-div">
                    <span>Lastname</span>
                    <span>{_staff.lastname}</span>
                </div>
                <hr />
                <div className="staff-salary-update-history-table-wrapper">
                    <span>Salary Update History</span>
                    <Table className='salary-update-history-table' fieldNames={['date', 'salary']} showImage={false} showIndex={false} onClickBtnFunction={null}
                        data={_staff.salary.map(item => ({ ...item, date: useFormatDate(item.date).slice(0, 10) }))} />
                </div>
                <hr />
                <form onSubmit={updateSalary} className="update-salary-section">
                    <span>Update Salary</span>
                    <input name="salary" type="number" />
                    <button>Update</button>
                </form>
                <hr />
                <div className="buttons">
                    <button className="btn red-btn" onClick={() => terminateStaffMember()}>
                        <i className="fa-solid fa-xmark" />
                        <span>Terminate Staff Member</span>
                    </button>
                    <button className="btn red-btn" onClick={() => deleteStaffMember()}>
                        <i className="fa-regular fa-trash-can" />
                        <span>Delete Staff Member</span>
                    </button>

                </div>
            </div>
        )
    }

    const RightSide = () => {
        return (
            <div className="right-side">
                {showAddStaffForm.value &&
                    <Form formHeaderTitle='Add Staff' buttonText='Add Staff' formMsg={addStaffFormMsg} submitFunction={addStaff}
                        closeBtnFunction={() => { batch(() => { addStaffFormMsg.value = ''; showAddStaffForm.value = false }) }}
                        formBodyFields={[{ name: 'name', type: 'text' }, { name: 'lastname', type: 'text' }, { name: 'gender', type: 'select', options: ['', 'female', 'male'] },
                        { name: 'phone-number', type: 'text' }, { name: 'identification-number', type: 'text' }, { name: 'role', type: 'select', options: ['', 'cheff', 'waiter', 'busser', 'dishwasher'] },
                        { name: 'salary', type: 'number' }, { name: 'start-date', type: 'date' }]} />}
                {showStaffInfo.value != -1 && <StaffInfoDiv />}
            </div>
        )
    }

    if (user.value.role != 'manager') return <span className="page-msg-span">You don't have access to this page</span>

    return (
        <div className="staff-page container">

            <div className="left-side">

                <div className="staff-page-header">
                    <h3>Staff</h3>
                    <button className="btn" onClick={() => { showStaffInfo.value = -1; showAddStaffForm.value = true }}>
                        <i className="fa-solid fa-plus" />
                        <span>Add Staff</span>
                    </button>
                </div>

                {staff && <Table fieldNames={['name', 'lastname', 'gender', 'phoneNumber', 'identificationNumber', 'role', 'salary', 'startDate', 'terminationDate']} showIndex={true}
                    onClickBtnFunction={(index) => { showStaffInfo.value = index }}
                    data={staff.map(member => ({
                        ...member, salary: member.salary[0].salary, startDate: useFormatDate(member.startDate).slice(0, 10),
                        terminationDate: member.terminationDate ? useFormatDate(member.terminationDate).slice(0, 10) : null
                    }))}
                />}

            </div>

            <RightSide />

        </div>
    )
}


