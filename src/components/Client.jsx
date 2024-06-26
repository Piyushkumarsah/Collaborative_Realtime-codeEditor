import React from 'react'
import Avatar from 'react-avatar'
export default function Client({userName}) {
  return (
    <div className='m-1 flex flex-col justify-center items-center'>
        <Avatar name={userName} size={50} round='14px'/>
        <span className='text-white'>{(userName.split(' ')[0]).toUpperCase()}</span>
    </div>
 )
}