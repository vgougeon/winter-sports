import { useForm } from 'react-hook-form'
import { GiDiceFire } from 'react-icons/gi'
import { motion } from 'framer-motion';
import socketService from '../../services/sockets.service';
import { useEffect } from 'react';
const gb = require('goby').init()
function LoginScreen() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    useEffect(() => {
        const pseudo = localStorage.getItem('pseudo')
        // if(pseudo) socketService.setPseudo(pseudo)
    })
    const submit = (data: { pseudo: string }) => {
        // socketService.setPseudo(data.pseudo)
        localStorage.setItem('pseudo', data.pseudo)
    }
    return (
        <motion.form initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}
        onSubmit={handleSubmit(submit)}
            className="absolute flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-700 to-transparent">
            <div className="w-1/3 mb-3 ">
                <h1 className="text-2xl text-white drop-shadow-xl filter">Choose a nickname
                <span className="ml-2 error">{errors.pseudo?.message}</span>
                </h1>
                
            </div>
            <div className="flex w-1/3 space-x-2">
                <motion.input whileFocus={{ borderRadius: '10px' }}
                    className="flex-grow p-4 text-white bg-white border border-white rounded shadow outline-none backdrop-filter backdrop-blur h-14 bg-opacity-10 border-opacity-10"
                    {...register('pseudo', {
                        maxLength: { value: 16, message: 'Nickname too long' },
                        minLength: { value: 3, message: 'Nickname too short' },
                        required: { value: true, message: 'Nickname required' },
                        pattern: { value: /[a-zA-Z\s]/, message: 'Nickname should only contain letters or spaces' }
                    })}
                    type="text" />
                <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
                    onClick={() => setValue('pseudo', gb.generate(['pre']))}
                    className="flex items-center justify-center bg-gray-700 border border-white rounded shadow hover:shadow-xl hover:bg-indigo-700 hover:border-opacity-30 border-opacity-10 h-14 w-14">
                    <GiDiceFire size={28} className="text-white" />
                </motion.button>
            </div>
            <div className="flex justify-center w-1/3 mt-3">
                <motion.button type="submit"
                whileTap={{ scale: 0.9 }}
                className="w-48 text-xl text-white bg-blue-600 border border-white rounded shadow-lg hover:bg-blue-700 h-14 border-opacity-30">
                    OK !
                </motion.button>
            </div>
            
        </motion.form>
    )
}


export default LoginScreen