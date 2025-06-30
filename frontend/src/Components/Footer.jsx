import { Facebook, Github, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import React from 'react'

const Footer = () => {
    return (
        <div>
            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold mb-4">GeoAlert</h4>
                            <p className="text-gray-400 text-sm">
                                Advanced disaster monitoring and alert system providing real-time global event tracking and notifications.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Disaster Preparedness</a></li>
                                <li><a href="#" className="hover:text-white transition">Emergency Contacts</a></li>
                                <li><a href="#" className="hover:text-white transition">Evacuation Routes</a></li>
                                <li><a href="#" className="hover:text-white transition">Safety Checklists</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Live Map</a></li>
                                <li><a href="#" className="hover:text-white transition">Alert History</a></li>
                                <li><a href="https://eonet.gsfc.nasa.gov/docs/v3" target='_blank' className="hover:text-white transition">API Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition">Mobile Apps</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    project@geoalert.org
                                </li>
                                <li className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    +91 9988992288
                                </li>
                                <li className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Global Monitoring Center
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2025 GeoAlert. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    )
}

export default Footer
