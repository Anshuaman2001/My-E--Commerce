import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { Plus, Trash2, MapPin } from 'lucide-react'

const ManageAddresses = () => {
    const { addressList, addAddress, deleteAddress } = useContext(ShopContext);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        label: 'HOME'
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Phone number exactly 10 digits
        const phoneStr = String(formData.phone).trim();
        if (phoneStr.length !== 10 || isNaN(Number(phoneStr))) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        await addAddress(formData);
        setShowForm(false);
        setFormData({
            firstName: '',
            lastName: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipcode: '',
            country: 'India',
            label: 'HOME'
        });
    }

    return (
        <div className='border-t pt-10 sm:pt-16'>
            <div className='text-2xl'>
                <Title text1={'MANAGE'} text2={'ADDRESSES'} />
            </div>

            <div className='mt-10 flex flex-col gap-6 max-w-4xl'>
                {/* Add New Address Button/Form */}
                {!showForm ? (
                    <div 
                        onClick={() => setShowForm(true)} 
                        className='flex items-center gap-4 border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-all group'
                    >
                        <Plus className='text-blue-600 group-hover:scale-110 transition-transform' size={24} />
                        <span className='font-medium text-blue-600 uppercase tracking-wide'>Add a new address</span>
                    </div>
                ) : (
                    <form onSubmit={onSubmitHandler} className='bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner flex flex-col gap-4'>
                        <p className='font-bold text-gray-700 uppercase mb-2'>Adding New Address</p>
                        <div className='flex gap-3'>
                            <input required name='firstName' onChange={onChangeHandler} value={formData.firstName} className='border border-gray-300 rounded py-2 px-3.5 w-full' type="text" placeholder='First Name' />
                            <input required name='lastName' onChange={onChangeHandler} value={formData.lastName} className='border border-gray-300 rounded py-2 px-3.5 w-full' type="text" placeholder='Last Name' />
                        </div>
                        <input required name='phone' onChange={onChangeHandler} value={formData.phone} className='border border-gray-300 rounded py-2 px-3.5 w-full' type="number" placeholder='Phone Number' />
                        <textarea required name='street' onChange={onChangeHandler} value={formData.street} className='border border-gray-300 rounded py-2 px-3.5 w-full' placeholder='Address (Area and Street)' rows={3}></textarea>
                        
                        <div className='flex gap-3'>
                            <input required name='city' onChange={onChangeHandler} value={formData.city} className='border border-gray-300 rounded py-2 px-3.5 w-full' type="text" placeholder='City/District/Town' />
                            <input required name='state' onChange={onChangeHandler} value={formData.state} className='border border-gray-300 rounded py-2 px-3.5 w-full' type="text" placeholder='State' />
                        </div>

                        <div className='flex gap-3'>
                            <input required name='zipcode' onChange={onChangeHandler} value={formData.zipcode} className='border border-gray-300 rounded py-2 px-3.5 w-full' type="number" placeholder='Locality / Pincode' />
                            <input required name='country' onChange={onChangeHandler} value={formData.country} className='border border-gray-300 rounded py-2 px-3.5 w-full' type="text" placeholder='Country' />
                        </div>

                        <div className='flex gap-4 mt-2'>
                            <p className='text-sm text-gray-500 self-center'>Address Type:</p>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input type="radio" name="label" value="HOME" checked={formData.label === 'HOME'} onChange={onChangeHandler} />
                                <span className='text-sm'>Home</span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input type="radio" name="label" value="WORK" checked={formData.label === 'WORK'} onChange={onChangeHandler} />
                                <span className='text-sm'>Work</span>
                            </label>
                        </div>

                        <div className='flex gap-4 mt-4'>
                            <button type='submit' className='bg-blue-600 text-white px-10 py-3 rounded shadow hover:bg-blue-700 transition-all font-medium'>SAVE ADDRESS</button>
                            <button onClick={() => setShowForm(false)} type='button' className='text-gray-500 font-medium px-4'>CANCEL</button>
                        </div>
                    </form>
                )}

                {/* Address List */}
                <div className='flex flex-col gap-4 mt-4'>
                    {addressList.length === 0 ? (
                        <div className='text-center py-20 text-gray-400'>
                            <MapPin size={40} className='mx-auto mb-4 opacity-20' />
                            <p>No saved addresses found. Add one to speed up your checkout!</p>
                        </div>
                    ) : (
                        addressList.map((item, index) => (
                            <div key={index} className='group border border-gray-200 p-6 rounded-lg hover:shadow-md transition-all relative bg-white'>
                                <div className='flex justify-between items-start mb-2'>
                                    <span className='bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest'>{item.label}</span>
                                    <button onClick={() => deleteAddress(index)} className='opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1'>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className='flex gap-4 mb-2'>
                                    <p className='font-bold text-gray-800'>{item.firstName} {item.lastName}</p>
                                    <p className='font-bold text-gray-800'>{item.phone}</p>
                                </div>
                                <p className='text-sm text-gray-600 leading-relaxed'>
                                    {item.street}, {item.city}, {item.state}, {item.country} - <span className='font-bold text-gray-900'>{item.zipcode}</span>
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageAddresses
